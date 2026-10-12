"""AI teaching: a long clay table that fills with simple faceless figures, and a small board at one end.
Nodes: Table, Board, Figure_1..Figure_8. Rest pose = every seat filled. Each figure's pivot is at its feet,
so it can rise or scale in from the floor."""
exec(open(r"C:/Users/anuda/orca/loopstak/blender/clay_lib.py").read())

col = fresh_collection("M_table")
TL, TW, TH = 2.7, 1.1, 0.56          # table length, width, height


def join(objs):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    return objs[0]


top = box("Table", (TL, TW, 0.1), loc=(0, 0, TH - 0.05), col=col, mat=clay_mat("warmgrey"), bevel=0.045, segs=3, subd=0)
legs = [cyl(f"leg{i}{j}", 0.05, TH - 0.08, loc=(i * (TL / 2 - 0.2), j * (TW / 2 - 0.18), (TH - 0.08) / 2), col=col,
            mat=clay_mat("warmgrey"), verts=12, bevel=0.02, segs=2, subd=0) for i in (-1, 1) for j in (-1, 1)]
notebooks = []
for side in (-1, 1):
    for i, x in enumerate((-0.95, -0.32, 0.32, 0.95)):
        y = side * 0.28
        notebooks.append(box("notebook", (0.38, 0.29, 0.035), loc=(x, y, TH + 0.0175),
                             col=col, mat=clay_mat("cream"), bevel=0.012, segs=2, subd=0))
        notebooks.append(box("notebook_spine", (0.026, 0.25, 0.009),
                             loc=(x - 0.145, y, TH + 0.037), col=col,
                             mat=clay_mat("stone"), bevel=0.004, segs=2, subd=0))
        for k, w in enumerate((0.2, 0.15)):
            notebooks.append(box("notebook_line", (w, 0.012, 0.007),
                                 loc=(x + 0.015, y + 0.055 - 0.065 * k, TH + 0.038), col=col,
                                 mat=clay_mat("warmgrey"), bevel=0.003, segs=1, subd=0))
join([top] + legs + notebooks)

# Board on a stand at the +X end: cream panel, charcoal lines, one mint mark (the idea that's theirs)
bx = TL / 2 + 0.55
panel = box("Board", (0.08, 0.9, 0.6), loc=(bx, 0, 1.05), col=col, mat=clay_mat("cream"), bevel=0.03, segs=3, subd=1)
parts = [panel]
for k, w in enumerate((0.6, 0.45, 0.5)):
    parts.append(box(f"bl{k}", (0.03, w, 0.05), loc=(bx - 0.05, -0.08 + (0.6 - w) / 2 - 0.0, 1.2 - 0.13 * k), col=col,
                     mat=clay_mat("charcoal"), bevel=0.015, segs=2, subd=1))
parts.append(box("bm", (0.035, 0.34, 0.07), loc=(bx - 0.05, -0.08 + 0.13, 0.82), col=col,
                 mat=clay_mat("mint"), bevel=0.02, segs=2, subd=1))
parts.append(cyl("stand", 0.035, 0.75, loc=(bx, 0, 0.375), col=col, mat=clay_mat("warmgrey"), verts=12, bevel=0.01, segs=2, subd=1))
parts.append(cyl("foot", 0.22, 0.05, loc=(bx, 0, 0.025), col=col, mat=clay_mat("warmgrey"), verts=24, bevel=0.02, segs=2, subd=1))
board = join(parts)
set_origin(board, (bx, 0, 0))
board.rotation_euler = (0, 0, math.radians(35))      # turn the written side toward the viewer


def figure(name, loc, key):
    x, y, _ = loc
    body = cyl(name, 0.15, 0.6, loc=(x, y, 0.3), col=col, mat=clay_mat(key), verts=14, bevel=0.12, segs=3, subd=1)
    # gentle taper: narrower shoulders than base
    for v in body.data.vertices:
        f = 0.82 + 0.18 * (1 - (v.co.z + 0.3) / 0.6)
        v.co.x *= f
        v.co.y *= f
    head = sphere(name + "_head", 0.1, loc=(x, y, 0.72), col=col, mat=clay_mat(key), seg=24, rings=12)
    o = join([body, head])
    set_origin(o, (x, y, 0))
    return o


xs = [-0.95, -0.32, 0.32, 0.95]
keys = ["stone", "sand", "warmgrey", "cream", "sand", "stone", "cream", "warmgrey"]
n = 0
for side in (-1, 1):
    for x in xs:
        figure(f"Figure_{n + 1}", (x, side * (TW / 2 + 0.28), 0), keys[n])
        n += 1

print("tris", tri_count(col.objects), [o.name for o in col.objects])
