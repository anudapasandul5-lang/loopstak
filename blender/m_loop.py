"""Hero infinity loop with mint data beads. Nodes: Loop, Bead_0..Bead_2 (local Z = along the path).
Loop path (Blender units, before glTF Y-up): x = A cos t / (1 + sin^2 t),
y = A sin t cos t / (1 + sin^2 t), z = H sin t. A = 1.6, H = 0.30."""
exec(open(r"C:/Users/anuda/orca/loopstak/blender/clay_lib.py").read())

A, H, R = 1.6, 0.30, 0.25   # loop half-width, over/under lift, tube radius


def loop_point(t):
    s = math.sin(t)
    d = 1 + s * s
    return Vector((A * math.cos(t) / d, A * s * math.cos(t) / d, H * s))


col = fresh_collection("M_loop")

# hand-rolled: thickness drifts a little; coil grooves spiral along it (baked into the texture)
loop = tube("Loop", loop_point, R, n_len=200, n_around=28, splits=4, col=col, mat=clay_mat("stone", pattern="coil"),
            rad_fn=lambda t: 1 + 0.035 * math.sin(3 * t + 0.4) + 0.015 * math.sin(7 * t))

def tangent(t):
    return (loop_point(t + 1e-3) - loop_point(t - 1e-3)).normalized()


for i in range(3):
    t = 2 * math.pi * (i / 3) + 0.9
    p = loop_point(t)
    b = sphere(f"Bead_{i}", R * 1.36, loc=(0, 0, 0), col=col, mat=clay_mat("mint"), seg=32, rings=16)
    # a cream band round the bead's waist, where the coil passes through it
    bpy.ops.mesh.primitive_torus_add(major_radius=R * 1.33, minor_radius=0.028, major_segments=40,
                                     minor_segments=10, location=(0, 0, 0))
    band = bpy.context.active_object
    for f in band.data.polygons:
        f.use_smooth = True
    band.data.materials.append(clay_mat("cream"))
    link(band, col)
    bpy.ops.object.select_all(action="DESELECT")
    band.select_set(True)
    b.select_set(True)
    bpy.context.view_layer.objects.active = b
    bpy.ops.object.join()
    # local Z (glTF local Y) runs along the loop, so the band wraps the coil
    b.rotation_euler = tangent(t).to_track_quat("Z", "Y").to_euler()
    b.location = p
    b["path_t"] = round(t, 4)

print("tris", tri_count(col.objects), [o.name for o in col.objects])
