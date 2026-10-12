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
            mat=clay_mat(key), bevel=0.065, segs=4, subd=1)
    s.rotation_euler = (0, 0, math.radians(jitter[i]))

print("tris", tri_count(col.objects), [o.name for o in col.objects])
