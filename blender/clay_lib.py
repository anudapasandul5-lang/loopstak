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


def clay_mat(key, rough=0.86, pattern=None):
    """Hand-made matte clay.
    Colour: slow tone wobble, lighter worn edges (pointiness), darker creases (local AO).
    Surface: fine grain + soft thumb dimples, plus an optional pattern:
      "coil"   spiral grooves along a tube (needs a "pattern" UV map: u along the length, v around)
      "strata" thin pressed layer lines (object Z)
    Everything here bakes into the texture, so the detail costs no geometry on the web."""
    name = "clay_" + key + ("_" + pattern if pattern else "")
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    N, L = nt.nodes, nt.links
    bsdf = next(n for n in N if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Roughness"].default_value = rough
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.3
    base = hex_rgba(PAL[key])
    coord = N.new("ShaderNodeTexCoord")

    def math(op, a=None, b=None, c=None):
        m = N.new("ShaderNodeMath"); m.operation = op
        for i, v in enumerate((a, b, c)):
            if v is None:
                continue
            if isinstance(v, (int, float)):
                m.inputs[i].default_value = v
            else:
                L.new(v, m.inputs[i])
        return m.outputs[0]

    # tone wobble
    tone = N.new("ShaderNodeTexNoise")
    tone.inputs["Scale"].default_value = 2.5
    tone.inputs["Detail"].default_value = 3.0
    L.new(coord.outputs["Object"], tone.inputs["Vector"])
    ramp = N.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = tuple(c * 0.9 for c in base[:3]) + (1,)
    ramp.color_ramp.elements[1].color = tuple(min(1, c * 1.06) for c in base[:3]) + (1,)
    L.new(tone.outputs["Fac"], ramp.inputs["Fac"])
    # worn edges and creases
    geo = N.new("ShaderNodeNewGeometry")
    edge = N.new("ShaderNodeMapRange")
    edge.inputs["From Min"].default_value = 0.47
    edge.inputs["From Max"].default_value = 0.56
    edge.inputs["To Min"].default_value = 0.94
    edge.inputs["To Max"].default_value = 1.12
    L.new(geo.outputs["Pointiness"], edge.inputs["Value"])
    ao = N.new("ShaderNodeAmbientOcclusion")
    ao.only_local = True
    ao.samples = 16
    ao.inputs["Distance"].default_value = 0.06
    cav = N.new("ShaderNodeMapRange")
    cav.inputs["To Min"].default_value = 0.62
    cav.inputs["To Max"].default_value = 1.0
    L.new(ao.outputs["AO"], cav.inputs["Value"])
    shade = math("MULTIPLY", edge.outputs[0], cav.outputs[0])
    mul = N.new("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"
    mul.inputs["Factor"].default_value = 1.0
    L.new(ramp.outputs["Color"], mul.inputs[6])
    comb = N.new("ShaderNodeCombineColor")
    for i in range(3):
        L.new(shade, comb.inputs[i])
    L.new(comb.outputs[0], mul.inputs[7])
    L.new(mul.outputs[2], bsdf.inputs["Base Color"])

    # surface: grain + dimples (+ pattern)
    grain = N.new("ShaderNodeTexNoise")
    grain.inputs["Scale"].default_value = 140.0
    grain.inputs["Detail"].default_value = 4.0
    L.new(coord.outputs["Object"], grain.inputs["Vector"])
    dimple = N.new("ShaderNodeTexVoronoi")
    dimple.feature = "SMOOTH_F1"
    dimple.inputs["Scale"].default_value = 7.0
    L.new(coord.outputs["Object"], dimple.inputs["Vector"])
    h = math("MULTIPLY_ADD", grain.outputs["Fac"], 0.25, math("MULTIPLY", dimple.outputs["Distance"], 0.6))
    if pattern == "coil":
        uv = N.new("ShaderNodeUVMap"); uv.uv_map = "pattern"
        sep = N.new("ShaderNodeSeparateXYZ"); L.new(uv.outputs[0], sep.inputs[0])
        ph = math("MULTIPLY_ADD", sep.outputs[0], 40.0, sep.outputs[1])          # 40 turns per strip
        groove = math("POWER", math("ABSOLUTE", math("SINE", math("MULTIPLY", ph, 6.2832))), 0.35)
        h = math("MULTIPLY_ADD", groove, 0.9, h)
    elif pattern == "strata":
        sep = N.new("ShaderNodeSeparateXYZ"); L.new(coord.outputs["Object"], sep.inputs[0])
        band = math("SINE", math("MULTIPLY", sep.outputs[2], 220.0))
        h = math("MULTIPLY_ADD", band, 0.25, h)
    bump = N.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.22
    bump.inputs["Distance"].default_value = 0.012
    L.new(h, bump.inputs["Height"])
    L.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def reset_materials():
    """Drop cached clay materials so edits to clay_mat take effect."""
    for m in list(bpy.data.materials):
        if m.name.startswith("clay_") or m.name.endswith("_bakesrc"):
            bpy.data.materials.remove(m)


def fresh_collection(name):
    col = bpy.data.collections.get(name)
    if col:
        for o in list(col.objects):
            bpy.data.objects.remove(o, do_unlink=True)
        bpy.data.orphans_purge(do_recursive=True)
    else:
        col = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(col)
    col.hide_viewport = False
    col.hide_render = False
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
    pat = bm.loops.layers.uv.new("pattern")      # unpacked: u along the strip, v around (for clay_mat "coil")
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
                loop[pat].uv = (uu, vv)
    if not cyclic:
        bmesh.ops.holes_fill(bm, edges=bm.edges, sides=n_around)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    me.uv_layers.active = me.uv_layers["UVMap"]
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
    """Product-shot light for the stills on #121212: big soft key, cool fill, strong warm rim."""
    _clear_rig()
    _world(0.04, "#ffffff")
    c = Vector(center)
    _area("key", c + Vector((-4.5, -4.0, 5.5)) * scale, c, 1500 * scale * scale, 4.5 * scale, (1.0, 0.95, 0.88))
    _area("fill", c + Vector((5, -3.5, 1.2)) * scale, c, 90 * scale * scale, 6 * scale, (0.86, 0.93, 1.0))
    _area("rim", c + Vector((2.5, 5.5, 3.5)) * scale, c, 1400 * scale * scale, 3 * scale, (1.0, 0.97, 0.92))
    _area("top", c + Vector((0, 0, 7)) * scale, c, 300 * scale * scale, 6 * scale)


# ---------- render settings ----------

FORCE_CPU = bpy.app.driver_namespace.get("clay_force_cpu", False)


def use_cycles(samples=128):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    if FORCE_CPU or bpy.app.driver_namespace.get("clay_force_cpu"):
        force_cpu()
        sc.cycles.samples = samples
        sc.cycles.use_denoising = True
        return "CPU"
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


def gpu_or_cpu(op, **kw):
    """Run a render/bake operator on the GPU; if CUDA fails, retry once on the CPU."""
    try:
        return op(**kw)
    except RuntimeError as e:
        print("GPU failed, retrying on CPU:", str(e)[:80])
        force_cpu()
        return op(**kw)


def force_cpu():
    sc = bpy.context.scene
    sc.cycles.device = "CPU"
    try:
        bpy.context.preferences.addons["cycles"].preferences.compute_device_type = "NONE"
    except TypeError:
        pass
    sc.cycles.denoiser = "OPENIMAGEDENOISE"
    if hasattr(sc.cycles, "denoising_use_gpu"):
        sc.cycles.denoising_use_gpu = False
    global FORCE_CPU
    FORCE_CPU = True


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
        for si, src in enumerate(o.data.materials):
            if not src.name.endswith("_bakesrc"):
                src = src.copy()
                src.name = f"{key}_{o.name}_{si}_bakesrc"
                o.data.materials[si] = src
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
        gpu_or_cpu(bpy.ops.object.bake, type="DIFFUSE", pass_filter={"DIRECT", "INDIRECT", "COLOR"}, margin=margin)
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


def _depth(o):
    d = 0
    while o.parent:
        o, d = o.parent, d + 1
    return d


def export_model(col, key, img, objs, extra=()):
    """Swap baked materials in, export GLB, then restore the clay materials for rendering."""
    prev = bpy.data.collections.get("PREVIEW")        # imported preview copies would steal part names
    if prev:
        for o in list(prev.objects):
            bpy.data.objects.remove(o, do_unlink=True)
    only_visible(col)
    for o in col.objects:
        o.hide_set(False)
    bm = baked_material(key, img)
    originals = {}
    for o in objs:
        # one slot with the baked material, so each part exports as a single primitive
        originals[o.name] = (list(o.data.materials), [p.material_index for p in o.data.polygons])
        o.data.name = o.name
        for p in o.data.polygons:
            p.material_index = 0
        while len(o.data.materials) > 1:
            o.data.materials.pop()
        o.data.materials[0] = bm
    # Wrap every part in an empty that carries its name and pivot; the mesh becomes "<name>_mesh" under it.
    # Compression (quantization) may move a mesh node's origin, but never an empty's, so the named
    # node the site animates keeps the exact pivot.
    parts = list(objs) + list(extra)
    parts.sort(key=_depth)                       # parents before children
    wrap, saved = {}, {}
    for o in parts:
        name = o.name
        saved[o] = (name, o.parent, o.matrix_world.copy())
        o.name = name + "_mesh"
        o.data.name = name + "_mesh"
        e = bpy.data.objects.new(name, None)
        col.objects.link(e)
        for k in o.keys():
            if k not in ("keep_uv",):
                e[k] = o[k]
        e.parent = wrap.get(o.parent)
        e.matrix_world = saved[o][2]
        wrap[o] = e
    for o in parts:
        o.parent = wrap[o]
        o.matrix_parent_inverse = Matrix.Identity(4)
        o.matrix_basis = Matrix.Identity(4)
    pattern_uv = {}
    for o in objs:
        lay = o.data.uv_layers.get("pattern")
        if lay:
            pattern_uv[o] = [tuple(d.uv) for d in lay.data]
            o.data.uv_layers.remove(lay)
    bpy.ops.object.select_all(action="DESELECT")
    for o in parts:
        o.select_set(True)
        wrap[o].select_set(True)
    path = RAW_DIR + f"/{key}.glb"
    os.makedirs(RAW_DIR, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=path, export_format="GLB", use_selection=True, export_apply=True,
        export_texcoords=True, export_normals=True, export_materials="EXPORT",
        export_cameras=False, export_lights=False, export_animations=False,
        export_yup=True, export_extras=True,
    )
    for o, uvs in pattern_uv.items():
        lay = o.data.uv_layers.new(name="pattern")
        for d, uv in zip(lay.data, uvs):
            d.uv = uv
        o.data.uv_layers.active = o.data.uv_layers["UVMap"]
    for o in parts:
        name, parent, mw = saved[o]
        o.parent = parent
        o.matrix_parent_inverse = parent.matrix_world.inverted() if parent else Matrix.Identity(4)
        o.matrix_world = mw
    for o in parts:
        bpy.data.objects.remove(wrap[o], do_unlink=True)
    for o in parts:
        o.name = saved[o][0]
        o.data.name = saved[o][0]
    for o in objs:
        mats, idx = originals[o.name]
        o.data.materials[0] = mats[0]
        for m in mats[1:]:
            o.data.materials.append(m)
        for p, i in zip(o.data.polygons, idx):
            p.material_index = i
    return path


# ---------- stills ----------

def render_still(col, key, cam_loc, target, lens=50, res=(2000, 1500), samples=320, center=(0, 0, 0), scale=1.0,
                 floor=True):
    only_visible(col)
    use_cycles(samples)
    render_rig(center, scale)
    sc = bpy.context.scene
    fl = bpy.data.objects.get("still_floor")
    if fl:
        bpy.data.objects.remove(fl, do_unlink=True)
    if floor:
        # invisible floor that only catches the soft contact shadow, so nothing floats
        zmin = min((o.matrix_world @ Vector(v)).z for o in col.objects if o.type == "MESH" and not o.hide_render
                   for v in o.bound_box)
        bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, zmin))
        fl = bpy.context.active_object
        fl.name = "still_floor"
        fl.is_shadow_catcher = True
        for c in fl.users_collection:
            c.objects.unlink(fl)
        col.objects.link(fl)
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
    gpu_or_cpu(bpy.ops.render.render, write_still=True)
    fl = bpy.data.objects.get("still_floor")
    if fl:
        bpy.data.objects.remove(fl, do_unlink=True)
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
    gpu_or_cpu(bpy.ops.render.render, write_still=True)
    return out
