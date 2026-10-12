"""Claude integration: a two-sided plug drops between two tool blocks and joins them; then they light mint.
Nodes: Block_A (a document tool), Block_B (a sheet tool), Plug, Block_A_Lit, Block_B_Lit (mint copies at the
same place, hidden at start; fade or swap them in when the plug lands)."""
exec(open(r"C:/Users/anuda/orca/loopstak/blender/clay_lib.py").read())

col = fresh_collection("M_plug")
S = 1.0                 # block size
X = 0.81                # block centre offset; gap between faces = 2X - S = 0.62
PRONG_Z = (0.12, -0.12)


def socket_cut(block, side):
    """Two round sockets in the block face that looks at the gap."""
    for z in PRONG_Z:
        c = cyl("cut", 0.07, 0.5, loc=(block.location.x - side * S / 2, 0, S / 2 + z), verts=20,
                bevel=0, subd=0, rot=(0, math.pi / 2, 0))
        m = block.modifiers.new("sock", "BOOLEAN")
        m.object = c
        m.solver = "EXACT"
        apply_mods(block)
        bpy.data.objects.remove(c, do_unlink=True)


def join(objs):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    return objs[0]


def block(name, x, key, mark_key, kind, side):
    b = box(name, (S, S, S), loc=(x, 0, S / 2), col=col, mat=clay_mat(key), bevel=0.16, segs=4, subd=1)
    socket_cut(b, side)
    b.data.materials.clear()
    b.data.materials.append(clay_mat(key))
    for p in b.data.polygons:
        p.material_index = 0
        p.use_smooth = True
    parts = [b]
    # A narrow mould seam wraps the casing below its rounded shoulder.
    for y in (-0.49, 0.49):
        parts.append(box(name + "_seam", (0.78, 0.02, 0.026), loc=(x, y, 0.72),
                         col=col, mat=clay_mat(key), bevel=0.006, segs=2, subd=0))
    for dx in (-0.49, 0.49):
        parts.append(box(name + "_seam", (0.02, 0.78, 0.026), loc=(x + dx, 0, 0.72),
                         col=col, mat=clay_mat(key), bevel=0.006, segs=2, subd=0))
    ztop = S + 0.025
    if kind == "doc":
        for k, w in enumerate((0.56, 0.56, 0.36)):
            parts.append(box(f"{name}_l{k}", (w, 0.1, 0.07), loc=(x - (0.56 - w) / 2, 0.2 - 0.2 * k, ztop),
                             col=col, mat=clay_mat(mark_key), bevel=0.03, segs=3, subd=1))
    else:
        for i in (-1, 1):
            for j in (-1, 1):
                parts.append(box(f"{name}_g{i}{j}", (0.24, 0.24, 0.07), loc=(x + 0.15 * i, 0.15 * j, ztop),
                                 col=col, mat=clay_mat(mark_key), bevel=0.04, segs=3, subd=1))
    return join(parts)


A = block("Block_A", -X, "stone", "charcoal", "doc", side=-1)
B = block("Block_B", X, "sand", "warmgrey", "grid", side=1)

# Plug: rounded body with two prongs each side, sitting in the gap (rest pose = connected)
body = box("Plug", (0.3, 0.46, 0.6), loc=(0, 0, S / 2), col=col, mat=clay_mat("cream"), bevel=0.1, segs=4, subd=1)
parts = [body]
for side in (-1, 1):
    for z in PRONG_Z:
        parts.append(cyl("prong", 0.055, 0.42, loc=(side * 0.36, 0, S / 2 + z), col=col, mat=clay_mat("warmgrey"),
                         verts=16, bevel=0.02, segs=2, subd=1, rot=(0, math.pi / 2, 0)))
grip = box("grip", (0.36, 0.5, 0.07), loc=(0, 0, S / 2 + 0.31), col=col, mat=clay_mat("warmgrey"), bevel=0.03, segs=3, subd=1)
for k in range(5):
    cut = box("grip_cut", (0.42, 0.022, 0.035), loc=(0, -0.16 + 0.08 * k, S / 2 + 0.344),
              bevel=0.006, segs=2, subd=0)
    mod = grip.modifiers.new("groove", "BOOLEAN")
    mod.object = cut
    mod.solver = "EXACT"
    apply_mods(grip)
    bpy.data.objects.remove(cut, do_unlink=True)
grip.data.materials.clear()
grip.data.materials.append(clay_mat("warmgrey"))
for p in grip.data.polygons:
    p.material_index = 0
parts.append(grip)
join(parts)

# Lit copies: same shape, mint clay
for src, mark in ((A, "cream"), (B, "cream")):
    lit = src.copy()
    lit.data = src.data.copy()
    lit.name = src.name + "_Lit"
    col.objects.link(lit)
    lit.data.materials[0] = clay_mat("mint")
    if len(lit.data.materials) > 1:
        lit.data.materials[1] = clay_mat(mark)

print("tris", tri_count(col.objects), [o.name for o in col.objects])
