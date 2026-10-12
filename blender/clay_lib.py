"""Shared helpers for the Loopstak clay models.

Run inside Blender 5.2 (through the Blender MCP or the Scripting tab):
    exec(open(r"C:/Users/anuda/orca/loopstak/blender/clay_lib.py").read())
Each model script builds its objects into its own collection, then calls
bake_model() and export_model().
"""
import bpy, bmesh, math, os
from mathutils import Vector, Matrix

ROOT = r"C:/Users/anuda/orca/loopstak"
RAW_DIR = ROOT + "/blender/raw"          # uncompressed GLBs (git-ignored)
MODEL_DIR = ROOT + "/public/models"
STILL_DIR = ROOT + "/public/stills"
BG_HEX = "#121212"

# Clay palette (sRGB hex). Mint only on "this is yours" parts.
PAL = {
    "charcoal": "#4a4743",
    "warmgrey": "#8c857c",
    "stone":    "#b9b0a2",
    "sand":     "#d6cdbd",
    "cream":    "#ece6cf",
    "mint":     "#02c39a",
}


def srgb_to_lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_rgba(h):
    h = h.lstrip("#")
    return tuple(srgb_to_lin(int(h[i:i + 2], 16) / 255) for i in (0, 2, 4)) + (1.0,)


def clay_mat(key, rough=0.88):
    """Matte clay: soft colour wobble and a faint fingertip bump."""
    name = "clay_" + key
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Roughness"].default_value = rough
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.25
    base = hex_rgba(PAL[key])
    coord = nt.nodes.new("ShaderNodeTexCoord")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 3.0
    noise.inputs["Detail"].default_value = 2.0
    nt.links.new(coord.outputs["Object"], noise.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = tuple(c * 0.93 for c in base[:3]) + (1,)
    ramp.color_ramp.elements[1].color = tuple(min(1, c * 1.05) for c in base[:3]) + (1,)
    nt.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    fine = nt.nodes.new("ShaderNodeTexNoise")
    fine.inputs["Scale"].default_value = 28.0
    fine.inputs["Detail"].default_value = 3.0
    nt.links.new(coord.outputs["Object"], fine.inputs["Vector"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.14
    bump.inputs["Distance"].default_value = 0.02
    nt.links.new(fine.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def fresh_collection(name):
    col = bpy.data.collections.get(name)
    if col:
        for o in list(col.objects):
            bpy.data.objects.remove(o, do_unlink=True)
        bpy.data.orphans_purge(do_recursive=True)
    else:
        col = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(col)
    return col


def link(obj, col):
    for c in obj.users_collection:
        c.objects.unlink(obj)
    col.objects.link(obj)
    return obj


def soften(obj, bevel=0.06, segs=3, subd=1, apply=True):
    """Round every edge, then smooth: the clay look."""
    if bevel:
        m = obj.modifiers.new("bevel", "BEVEL")
        m.width = bevel
        m.segments = segs
        m.limit_method = "NONE"
        m.harden_normals = False
    if subd:
        s = obj.modifiers.new("subd", "SUBSURF")
        s.levels = subd
        s.render_levels = subd
    for p in obj.data.polygons:
        p.use_smooth = True
    if apply:
        apply_mods(obj)
    return obj


def apply_mods(obj):
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    for m in list(obj.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)


def box(name, size, loc=(0, 0, 0), col=None, mat=None, bevel=0.06, segs=3, subd=1):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    soften(o, bevel=bevel, segs=segs, subd=subd)
    if mat:
        o.data.materials.append(mat)
    if col:
        link(o, col)
    return o


def sphere(name, r, loc=(0, 0, 0), col=None, mat=None, seg=24, rings=12):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=seg, ring_count=rings, location=loc)
    o = bpy.context.active_object
    o.name = name
    for p in o.data.polygons:
        p.use_smooth = True
    if mat:
        o.data.materials.append(mat)
    if col:
        link(o, col)
    return o


def cyl(name, r, depth, loc=(0, 0, 0), col=None, mat=None, verts=32, bevel=0.03, segs=3, subd=1, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, vertices=verts, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    soften(o, bevel=bevel, segs=segs, subd=subd)
    if mat:
        o.data.materials.append(mat)
    if col:
        link(o, col)
    return o


def tube(name, fn, radius, n_len=160, n_around=24, splits=4, col=None, mat=None, cyclic=True, rad_fn=None):
    """Closed tube along a parametric path fn(t), t in [0, 2pi) when cyclic.
    Builds its own UVs: `splits` strips along the length, so a self-crossing path never
    shares texture pixels. Flags keep_uv for bake_model."""
    bm = bmesh.new()
    rings = []
    steps = n_len if cyclic else n_len + 1
    span = 2 * math.pi if cyclic else 1.0
    for i in range(steps):
        t = span * i / n_len
        p = fn(t)
        tan = (fn(t + 1e-3) - fn(t - 1e-3)).normalized()
        up = Vector((0, 0, 1)) if abs(tan.z) < 0.9 else Vector((1, 0, 0))
        nrm = tan.cross(up).normalized()
        bin_ = tan.cross(nrm).normalized()
        r = radius * (rad_fn(t) if rad_fn else 1.0)
        ring = []
        for j in range(n_around):
            a = 2 * math.pi * j / n_around
            ring.append(bm.verts.new(p + r * (math.cos(a) * nrm + math.sin(a) * bin_)))
        rings.append(ring)
    uv = bm.loops.layers.uv.new("UVMap")
    per = n_len / splits
    nseg = n_len if cyclic else n_len
    for i in range(nseg):
        r0, r1 = rings[i], rings[(i + 1) % len(rings)]
        strip = int(i // per)
        u0 = (i - strip * per) / per
        u1 = (i + 1 - strip * per) / per
        for j in range(n_around):
            j1 = (j + 1) % n_around
            f = bm.faces.new((r0[j], r1[j], r1[j1], r0[j1]))
            f.smooth = True
            v0, v1 = j / n_around, (j + 1) / n_around
            # strips side by side in the 0-1 square; pack_islands rescales them later
            off = strip * 1.1
            for loop, (uu, vv) in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))):
                loop[uv].uv = (off + uu, vv)
    if not cyclic:
        bmesh.ops.holes_fill(bm, edges=bm.edges, sides=n_around)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    (col or bpy.context.scene.collection).objects.link(o)
    o["keep_uv"] = True
    if mat:
        me.materials.append(mat)
    return o


def set_origin(obj, point):
    """Move the pivot to a world point without moving the mesh."""
    point = Vector(point)
    local = obj.matrix_world.inverted() @ point
    obj.data.transform(Matrix.Translation(-local))
    obj.matrix_world = obj.matrix_world @ Matrix.Translation(local)


def tri_count(objs):
    return sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in objs if o.type == "MESH")


# ---------- lighting rigs ----------

def _world(strength, hex_col):
    w = bpy.context.scene.world or bpy.data.worlds.new("World")
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    for n in list(nt.nodes):
        if n.type not in ("BACKGROUND", "OUTPUT_WORLD"):
            nt.nodes.remove(n)
    bg = next(n for n in nt.nodes if n.type == "BACKGROUND")
    bg.inputs["Color"].default_value = hex_rgba(hex_col)
    bg.inputs["Strength"].default_value = strength


def _clear_rig():
    for o in list(bpy.data.objects):
        if o.get("clay_rig"):
            bpy.data.objects.remove(o, do_unlink=True)


def _area(name, loc, target, power, size, color=(1, 1, 1)):
    ld = bpy.data.lights.new(name, "AREA")
    ld.energy = power
    ld.size = size
    ld.color = color
    o = bpy.data.objects.new(name, ld)
    bpy.context.scene.collection.objects.link(o)
    o.location = loc
    d = Vector(target) - Vector(loc)
    o.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    o["clay_rig"] = True
    return o


def bake_rig(center=(0, 0, 0), scale=1.0):
    """Sky-style light only: bright from above, a little from the front, dim below.
    No lamps, so it does not matter where an object sits while it bakes, and the
    result still reads right when the model turns at runtime. Calibrated so an open
    top face bakes to about its own clay colour (good for an unlit material on the web)."""
    _clear_rig()
    w = bpy.context.scene.world or bpy.data.worlds.new("World")
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    for n in list(nt.nodes):
        if n.type not in ("BACKGROUND", "OUTPUT_WORLD"):
            nt.nodes.remove(n)
    bg = next(n for n in nt.nodes if n.type == "BACKGROUND")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Generated"], sep.inputs[0])
    # brightness = 0.15 + 1.25*z - 0.4*y  (y<0 is towards the viewer)
    mz = nt.nodes.new("ShaderNodeMath"); mz.operation = "MULTIPLY_ADD"
    mz.inputs[1].default_value = 1.25; mz.inputs[2].default_value = 0.15
    nt.links.new(sep.outputs["Z"], mz.inputs[0])
    my = nt.nodes.new("ShaderNodeMath"); my.operation = "MULTIPLY_ADD"
    my.inputs[1].default_value = -0.4
    nt.links.new(sep.outputs["Y"], my.inputs[0])
    nt.links.new(mz.outputs[0], my.inputs[2])
    cl = nt.nodes.new("ShaderNodeClamp")
    cl.inputs["Min"].default_value = 0.08; cl.inputs["Max"].default_value = 1.8
    nt.links.new(my.outputs[0], cl.inputs["Value"])
    nt.links.new(cl.outputs[0], bg.inputs["Strength"])
    bg.inputs["Color"].default_value = hex_rgba("#fbf7ef")


def render_rig(center=(0, 0, 0), scale=1.0):
    """Studio key/fill/rim for the stills on #121212."""
    _clear_rig()
    _world(0.05, "#ffffff")
    c = Vector(center)
    _area("key", c + Vector((-4, -4.5, 5)) * scale, c, 1100 * scale * scale, 5 * scale, (1.0, 0.96, 0.9))
    _area("fill", c + Vector((5, -3, 1.5)) * scale, c, 60 * scale * scale, 6 * scale, (0.9, 0.95, 1.0))
    _area("rim", c + Vector((1, 5, 4)) * scale, c, 600 * scale * scale, 4 * scale)


# ---------- render settings ----------

def use_cycles(samples=128):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        for dev_type in ("OPTIX", "CUDA"):
            try:
                prefs.compute_device_type = dev_type
                prefs.get_devices()
                if any(d.type == dev_type for d in prefs.devices):
                    for d in prefs.devices:
                        d.use = True
                    sc.cycles.device = "GPU"
                    break
            except TypeError:
                continue
    except Exception as e:
        print("GPU setup skipped:", e)
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    return sc.cycles.device


def only_visible(col):
    """Hide every model collection except this one (render and viewport)."""
    for c in bpy.context.scene.collection.children:
        hide = c != col
        c.hide_render = hide
        c.hide_viewport = hide
    for o in bpy.context.scene.collection.objects:
        if o.type == "MESH":
            o.hide_render = True
            o.hide_set(True)


# ---------- bake ----------

def bake_model(col, key, size=1024, margin=3, samples=96, skip=(), groups=None):
    """UV-pack every mesh in the collection into one atlas and bake soft light + AO into it.
    Each group (default: each object) is moved far from the others while baking, so a part
    that moves at runtime carries no shadow from its neighbours. Objects named in `skip`
    keep their own material (e.g. screenshot planes)."""
    only_visible(col)
    use_cycles(samples)
    bake_rig()
    objs = [o for o in col.objects if o.type == "MESH" and o.name not in skip]
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.hide_set(False)
        o.select_set(True)
        if not o.data.uv_layers:
            o.data.uv_layers.new(name="UVMap")
    # Objects flagged keep_uv already have clean islands (e.g. tubes that cross themselves,
    # where a projection would stack two parts on the same pixels).
    auto = [o for o in objs if not o.get("keep_uv")]
    if auto:
        bpy.ops.object.select_all(action="DESELECT")
        for o in auto:
            o.select_set(True)
        bpy.context.view_layer.objects.active = auto[0]
        bpy.ops.object.mode_set(mode="EDIT")
        bpy.ops.mesh.select_all(action="SELECT")
        bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.01, scale_to_bounds=False)
        bpy.ops.object.mode_set(mode="OBJECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.context.scene.tool_settings.use_uv_select_sync = True
    bpy.ops.uv.pack_islands(margin=0.01, rotate=True)
    bpy.ops.mesh.select_all(action="DESELECT")
    bpy.ops.uv.select_overlap()
    overlap = sum(sum(1 for f in bmesh.from_edit_mesh(o.data).faces if f.select) for o in objs)
    bpy.context.scene.tool_settings.use_uv_select_sync = False
    bpy.ops.object.mode_set(mode="OBJECT")
    print("uv overlap faces:", overlap)

    img_name = key + "_bake"
    old = bpy.data.images.get(img_name)
    if old:
        bpy.data.images.remove(old)
    img = bpy.data.images.new(img_name, size, size, alpha=False)
    for o in objs:
        src = o.data.materials[0]
        if not src.name.endswith("_bakesrc"):
            src = src.copy()
            src.name = f"{key}_{o.name}_bakesrc"
            o.data.materials[0] = src
        nodes = src.node_tree.nodes
        n = next((x for x in nodes if x.type == "TEX_IMAGE"), None) or nodes.new("ShaderNodeTexImage")
        n.image = img
        nodes.active = n

    if groups is None:
        groups = [[o.name] for o in objs]
    saved = {o.name: o.matrix_world.copy() for o in objs}
    for gi, names in enumerate(groups):
        for nm in names:
            o = bpy.data.objects[nm]
            o.matrix_world = Matrix.Translation((gi * 40.0, 0, 0)) @ o.matrix_world
    sc = bpy.context.scene
    sc.render.bake.margin = margin
    try:
        bpy.ops.object.bake(type="DIFFUSE", pass_filter={"DIRECT", "INDIRECT", "COLOR"}, margin=margin)
    finally:
        for o in objs:
            o.matrix_world = saved[o.name]
    path = RAW_DIR + f"/{key}_bake.png"
    os.makedirs(RAW_DIR, exist_ok=True)
    img.filepath_raw = path
    img.file_format = "PNG"
    img.save()
    return img, objs


def baked_material(key, img):
    """One shared export material: the baked atlas as base colour, fully rough."""
    name = key + "_baked"
    m = bpy.data.materials.get(name)
    if m:
        bpy.data.materials.remove(m)
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Roughness"].default_value = 1.0
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.0
    t = nt.nodes.new("ShaderNodeTexImage")
    t.image = img
    nt.links.new(t.outputs["Color"], bsdf.inputs["Base Color"])
    return m


def export_model(col, key, img, objs, extra=()):
    """Swap baked materials in, export GLB, then restore the clay materials for rendering."""
    bm = baked_material(key, img)
    originals = {}
    for o in objs:
        originals[o.name] = o.data.materials[0]
        o.data.name = o.name
        o.data.materials[0] = bm
    bpy.ops.object.select_all(action="DESELECT")
    for o in list(objs) + list(extra):
        o.select_set(True)
    path = RAW_DIR + f"/{key}.glb"
    os.makedirs(RAW_DIR, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=path, export_format="GLB", use_selection=True, export_apply=True,
        export_texcoords=True, export_normals=True, export_materials="EXPORT",
        export_cameras=False, export_lights=False, export_animations=False,
        export_yup=True, export_extras=True,
    )
    for o in objs:
        src = originals[o.name]
        # restore the plain clay material (strip the bake copy)
        o.data.materials[0] = src
    return path


# ---------- stills ----------

def render_still(col, key, cam_loc, target, lens=50, res=(1600, 1200), samples=160, center=(0, 0, 0), scale=1.0):
    only_visible(col)
    use_cycles(samples)
    render_rig(center, scale)
    sc = bpy.context.scene
    cam = bpy.data.objects.get("still_cam")
    if not cam:
        cam = bpy.data.objects.new("still_cam", bpy.data.cameras.new("still_cam"))
        sc.collection.objects.link(cam)
    cam.data.lens = lens
    cam.location = cam_loc
    d = Vector(target) - Vector(cam_loc)
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    sc.camera = cam
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    try:
        sc.view_settings.view_transform = "AgX"
        sc.view_settings.look = "AgX - Punchy"
    except TypeError:
        pass
    out = RAW_DIR + f"/still_{key}.png"
    sc.render.filepath = out
    bpy.ops.render.render(write_still=True)
    return out


# ---------- web preview ----------

def preview_glb(path, key, cam_loc, target, lens=50, res=(800, 600)):
    """Import an exported GLB and render it unlit (baked texture only), the way a
    MeshBasicMaterial shows it on the site. Saves raw/preview_<key>.png."""
    col = fresh_collection("PREVIEW")
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    for o in set(bpy.data.objects) - before:
        link(o, col)
        if o.type == "MESH":
            for i, m in enumerate(o.data.materials):
                tex = next((n for n in m.node_tree.nodes if n.type == "TEX_IMAGE"), None)
                um = bpy.data.materials.new("unlit_" + m.name)
                um.use_nodes = True
                nt = um.node_tree
                for n in list(nt.nodes):
                    if n.type != "OUTPUT_MATERIAL":
                        nt.nodes.remove(n)
                em = nt.nodes.new("ShaderNodeEmission")
                out = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
                nt.links.new(em.outputs[0], out.inputs["Surface"])
                if tex:
                    t = nt.nodes.new("ShaderNodeTexImage")
                    t.image = tex.image
                    nt.links.new(t.outputs["Color"], em.inputs["Color"])
                o.data.materials[i] = um
    only_visible(col)
    _clear_rig()
    _world(0.0, "#000000")
    sc = bpy.context.scene
    use_cycles(16)
    cam = bpy.data.objects.get("still_cam")
    if not cam:
        cam = bpy.data.objects.new("still_cam", bpy.data.cameras.new("still_cam"))
        sc.collection.objects.link(cam)
    cam.data.lens = lens
    cam.location = cam_loc
    cam.rotation_euler = (Vector(target) - Vector(cam_loc)).to_track_quat("-Z", "Y").to_euler()
    sc.camera = cam
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.film_transparent = True
    try:
        sc.view_settings.view_transform = "Standard"
        sc.view_settings.look = "None"
    except TypeError:
        pass
    out = RAW_DIR + f"/preview_{key}.png"
    sc.render.filepath = out
    bpy.ops.render.render(write_still=True)
    return out
