"""AI agents: a ring of six meshing clay gears, a message bubble that goes in and a mint reply that comes out.
Nodes: Gear_0..Gear_5, Message (cream bubble), Reply (mint bubble).
Each gear's pivot is its own axle (Blender Z = glTF Y); neighbours turn in opposite directions."""
exec(open(r"C:/Users/anuda/orca/loopstak/blender/clay_lib.py").read())

col = fresh_collection("M_gears")
R0, AMP, TEETH, THICK = 0.5, 0.08, 12, 0.3
RING = 2 * R0 + 0.03                     # hexagon: centre-to-centre = ring radius
PITCH = 2 * math.pi / TEETH


def gear(name, center, phase, key):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "2D"
    cu.fill_mode = "BOTH"
    cu.bevel_depth = 0.045
    cu.bevel_resolution = 2
    cu.extrude = THICK / 2 - 0.045
    n = 96
    sp = cu.splines.new("POLY")
    sp.points.add(n - 1)
    for i in range(n):
        a = 2 * math.pi * i / n
        r = R0 + AMP * math.tanh(2.2 * math.cos(TEETH * (a - phase))) / math.tanh(2.2)
        sp.points[i].co = (r * math.cos(a), r * math.sin(a), 0, 1)
    sp.use_cyclic_u = True
    hole = cu.splines.new("POLY")
    hole.points.add(31)
    for i in range(32):
        a = -2 * math.pi * i / 32
        hole.points[i].co = (0.09 * math.cos(a), 0.09 * math.sin(a), 0, 1)
    hole.use_cyclic_u = True
    o = bpy.data.objects.new(name, cu)
    col.objects.link(o)
    o.location = center
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.convert(target="MESH")
    o = bpy.context.active_object
    o.name = name
    for p in o.data.polygons:
        p.use_smooth = True
    o.data.materials.append(clay_mat(key))
    # raised hub ring in a darker clay, joined into the gear
    hub = cyl(name + "_hub", 0.2, THICK + 0.08, loc=center, verts=20, bevel=0.04, segs=2, subd=1)
    hole_cut = hub.modifiers.new("hole", "BOOLEAN")
    cutter = cyl(name + "_cut", 0.09, THICK + 0.4, loc=center, verts=24, bevel=0, subd=0)
    hole_cut.object = cutter
    hole_cut.solver = "EXACT"
    apply_mods(hub)
    bpy.data.objects.remove(cutter, do_unlink=True)
    hub.data.materials.clear()
    for p in hub.data.polygons:
        p.use_smooth = True
        p.material_index = 0
    hub.data.materials.append(clay_mat("warmgrey"))
    bpy.ops.object.select_all(action="DESELECT")
    hub.select_set(True)
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.join()
    return o


for i in range(6):
    th = math.radians(60 * i)
    c = (RING * math.cos(th), RING * math.sin(th), 0)
    to_next = th + math.radians(120)                 # direction to gear i+1
    phase = to_next if i % 2 == 0 else to_next + PITCH / 2
    gear(f"Gear_{i}", c, phase, "stone" if i % 2 == 0 else "cream")


def bubble(name, loc, key, mark_key, kind, flip=False):
    """Upright chat bubble facing the viewer (-Y), tail at a bottom corner."""
    x, y, z = loc
    parts = [box(name, (0.86, 0.2, 0.56), loc=loc, col=col, mat=clay_mat(key), bevel=0.14, segs=4, subd=1)]
    t = box(name + "_tail", (0.2, 0.2, 0.2), loc=(x + (0.3 if flip else -0.3), y, z - 0.27), col=col,
            mat=clay_mat(key), bevel=0.06, segs=3, subd=1)
    t.rotation_euler = (0, math.radians(45), 0)
    parts.append(t)
    if kind == "dots":
        for k in (-1, 0, 1):
            parts.append(sphere(name + f"_dot{k}", 0.065, loc=(x + 0.22 * k, y - 0.1, z), col=col,
                                mat=clay_mat(mark_key), seg=16, rings=8))
    else:
        for k, w in ((0, 0.52), (1, 0.34)):
            parts.append(box(name + f"_line{k}", (w, 0.06, 0.08), loc=(x - (0.52 - w) / 2, y - 0.1, z + 0.08 - 0.16 * k),
                             col=col, mat=clay_mat(mark_key), bevel=0.035, segs=3, subd=1))
    bpy.ops.object.select_all(action="DESELECT")
    for p in parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    return parts[0]


bubble("Message", (-2.55, -0.3, 0.45), "cream", "warmgrey", "dots")
bubble("Reply", (2.55, -0.3, 0.45), "mint", "cream", "lines", flip=True)

print("tris", tri_count(col.objects), [o.name for o in col.objects])
