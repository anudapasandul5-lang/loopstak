"""Process stack: 6 soft clay slabs, bottom to top. Nodes: Slab_1..Slab_6 (Slab_6 mint, the finished site).
Rest pose = stacked. Each pivot sits at the slab's centre, so slabs can drop in along Y."""
exec(open(r"C:/Users/anuda/orca/loopstak/blender/clay_lib.py").read())

col = fresh_collection("M_stack")
W, D, T, GAP = 2.4, 1.6, 0.24, 0.035
colours = ["charcoal", "warmgrey", "stone", "sand", "cream", "mint"]
jitter = [0, 2.5, -1.5, 3.0, -2.0, 1.0]           # degrees: hand-stacked, not machined
shift = [(0, 0), (0.03, -0.02), (-0.04, 0.01), (0.02, 0.03), (-0.02, -0.02), (0.01, 0.0)]
for i, key in enumerate(colours):
    z = T / 2 + i * (T + GAP)
    s = box(f"Slab_{i + 1}", (W, D, T), loc=(shift[i][0], shift[i][1], z), col=col,
            mat=clay_mat(key, pattern="strata"), bevel=0.065, segs=4, subd=1)
    if i == 5:
        # A finished page pressed into the top slab; all marks travel with the slab.
        layout = [(1.96, 0.09, 0, 0.56), (0.85, 0.13, -0.55, 0.27),
                  (0.65, 0.055, -0.65, 0.09), (0.38, 0.13, -0.78, -0.13),
                  (0.68, 0.46, 0.58, 0.09)]
        layout += [(0.56, 0.24, x, -0.49) for x in (-0.7, 0, 0.7)]
        marks = [box(f"layout_{k}", (w, h, 0.035),
                     loc=(s.location.x + x, s.location.y + y, z + T / 2 + 0.012),
                     col=col, mat=clay_mat("cream"), bevel=0.012, segs=2, subd=0)
                 for k, (w, h, x, y) in enumerate(layout)]
        bpy.ops.object.select_all(action="DESELECT")
        for o in [s] + marks:
            o.select_set(True)
        bpy.context.view_layer.objects.active = s
        bpy.ops.object.join()
    s.rotation_euler = (0, 0, math.radians(jitter[i]))

print("tris", tri_count(col.objects), [o.name for o in col.objects])
