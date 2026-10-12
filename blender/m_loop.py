"""Hero infinity loop with mint data beads. Nodes: Loop, Bead_0..Bead_2.
Loop path (Blender units, before glTF Y-up): x = A cos t / (1 + sin^2 t),
y = A sin t cos t / (1 + sin^2 t), z = H sin t. A = 1.6, H = 0.30."""
exec(open(r"C:/Users/anuda/orca/loopstak/blender/clay_lib.py").read())

A, H, R = 1.6, 0.30, 0.25   # loop half-width, over/under lift, tube radius


def loop_point(t):
    s = math.sin(t)
    d = 1 + s * s
    return Vector((A * math.cos(t) / d, A * s * math.cos(t) / d, H * s))


col = fresh_collection("M_loop")

loop = tube("Loop", loop_point, R, n_len=192, n_around=24, splits=4, col=col, mat=clay_mat("stone"))

for i in range(3):
    t = 2 * math.pi * (i / 3) + 0.9
    b = sphere(f"Bead_{i}", R * 1.36, loc=loop_point(t), col=col, mat=clay_mat("mint"), seg=24, rings=12)
    b["path_t"] = round(t, 4)

print("tris", tri_count(col.objects), [o.name for o in col.objects])
