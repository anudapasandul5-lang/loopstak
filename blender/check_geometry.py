import bpy, math
from mathutils import Vector
bpy.app.driver_namespace["clay_force_cpu"] = True
CHECK_LIB = r"C:/Users/anuda/orca/loopstak/blender/"
expected = {
    "loop": {"Loop", "Bead_0", "Bead_1", "Bead_2"},
    "stack": {f"Slab_{i}" for i in range(1, 7)},
    "gears": {f"Gear_{i}" for i in range(6)} | {"Message", "Reply"},
    "site": {"Base", "Bar", "Title", "Subtitle", "Button", "Picture", "Card_1", "Card_2", "Card_3"},
    "plug": {"Block_A", "Block_B", "Plug", "Block_A_Lit", "Block_B_Lit"},
    "table": {"Table", "Board"} | {f"Figure_{i}" for i in range(1, 9)},
    "keys": {"Frame", "Door", "Key", "Inside"},
}
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)
for check_key, names in expected.items():
    exec(open(CHECK_LIB + "m_" + check_key + ".py").read())
    col = bpy.data.collections["M_" + check_key]
    assert {o.name for o in col.objects} == names, (check_key, "unexpected animation parts")
    for o in col.objects:
        assert o.type == "MESH" and len(o.data.polygons), (check_key, o.name, "empty mesh")
        assert all(math.isfinite(c) for v in o.data.vertices for c in v.co), (check_key, o.name, "bad vertex")
        assert all(p.material_index < len(o.data.materials) for p in o.data.polygons), (check_key, o.name, "bad slot")
    if check_key == "gears":
        for i in range(6):
            gear_ob = bpy.data.objects[f"Gear_{i}"]
            phase = math.radians(60 * i + 120) + (math.pi / 12 if i % 2 else 0)
            for k in range(3):
                a = phase + k * 2 * math.pi / 3
                hit, *_ = gear_ob.ray_cast(Vector((0.32 * math.cos(a), 0.32 * math.sin(a), 1)), Vector((0, 0, -1)))
                assert not hit, (gear_ob.name, k, "spoke opening filled")
    if check_key == "keys":
        assert bpy.data.objects["Key"].parent == bpy.data.objects["Door"], "key must travel with door"
        bpy.context.view_layer.update()
        key_axis = (bpy.data.objects["Key"].matrix_world.to_3x3() @ Vector((0, 1, 0))).normalized()
        assert key_axis.dot(Vector((0, 1, 0))) > 0.999, "key's local turn axis misses the lock"
        key_ob, door_ob = bpy.data.objects["Key"], bpy.data.objects["Door"]
        key_tip = key_ob.matrix_world.translation.copy()
        key_tip.y = max((key_ob.matrix_world @ v.co).y for v in key_ob.data.vertices)
        hit, *_ = door_ob.ray_cast(door_ob.matrix_world.inverted() @ key_tip, Vector((0, 1, 0)), distance=0.025)
        assert hit, "key tip is detached from the lock"
    bpy.context.view_layer.update()
    floor_min = min((o.matrix_world @ v.co).z for o in col.objects for v in o.data.vertices)
    def check_floor(op, **kwargs):
        assert abs(bpy.data.objects["still_floor"].location.z - floor_min) < 1e-6, "floor misses actual surface"
    saved_operator = gpu_or_cpu
    gpu_or_cpu = check_floor
    try:
        render_still(col, "geometry_check", (0, -6, 3), (0, 0, 0), res=(16, 16), samples=1)
    finally:
        gpu_or_cpu = saved_operator
    print("Geometry OK:", check_key, flush=True)

if os.path.isfile(RAW_DIR + "/plug.glb"):
    saved_operator = gpu_or_cpu
    gpu_or_cpu = lambda op, **kwargs: None
    try:
        preview_glb(RAW_DIR + "/plug.glb", "plug", (0.9, -4.2, 2.6), (0, 0, 0.5))
        for n in ("Block_A_Lit_mesh", "Block_B_Lit_mesh"):
            assert bpy.data.objects[n].hide_render, "lit blocks overlap the default plug preview"
        for n in ("Block_A_mesh", "Block_B_mesh"):
            assert not bpy.data.objects[n].hide_render, "default plug block is hidden"
    finally:
        gpu_or_cpu = saved_operator
    print("Exported plug preview state OK", flush=True)
