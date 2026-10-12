"""Keys section: a mint key turns in the lock, then the door swings open.
Nodes: Frame (door frame), Door (pivot on its hinge, left edge), Key (mint, child of Door, pivot on the keyhole axis),
Inside (mint floor tile behind the door).
Rest pose = closed door, key in the lock with its bow upright."""
exec(open(r"C:/Users/anuda/orca/loopstak/blender/clay_lib.py").read())

col = fresh_collection("M_keys")
OW, OH, DEPTH = 1.6, 2.4, 0.32         # outer frame
IW, IH = 1.12, 2.06                     # opening
DT = 0.12                               # door thickness


def join(objs):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    return objs[0]


# Frame: two jambs and a lintel, each softened, joined into one part
JW = (OW - IW) / 2
jl = box("Frame", (JW, DEPTH, OH), loc=(-(IW + JW) / 2, 0, OH / 2), col=col, mat=clay_mat("charcoal"), bevel=0.06, segs=3, subd=1)
jr = box("jr", (JW, DEPTH, OH), loc=((IW + JW) / 2, 0, OH / 2), col=col, mat=clay_mat("charcoal"), bevel=0.06, segs=3, subd=1)
li = box("li", (OW, DEPTH, OH - IH), loc=(0, 0, IH + (OH - IH) / 2), col=col, mat=clay_mat("charcoal"), bevel=0.06, segs=3, subd=1)
for piece in (jr, li):
    union = jl.modifiers.new("frame_union", "BOOLEAN")
    union.operation = "UNION"
    union.solver = "EXACT"
    union.object = piece
    apply_mods(jl)
    bpy.data.objects.remove(piece, do_unlink=True)
frame = jl
frame.data.materials.clear()
frame.data.materials.append(clay_mat("charcoal"))
for p in frame.data.polygons:
    p.material_index = 0
    p.use_smooth = True

# Door with a lock plate and a dark keyhole
gap = 0.025
door = box("Door", (IW - 2 * gap, DT, IH - gap), loc=(0, 0, (IH - gap) / 2), col=col, mat=clay_mat("stone"),
           bevel=0.04, segs=3, subd=1)
LX, LZ = IW / 2 - 0.2, 1.02             # lock position on the door front
FRONT = -DT / 2
for z, h in ((0.47, 0.58), (1.56, 0.63)):
    cut = box("panel_cut", (0.72, 0.08, h), loc=(-0.06, FRONT - 0.016, z),
              bevel=0.025, segs=3, subd=0)
    mod = door.modifiers.new("inset_panel", "BOOLEAN")
    mod.object = cut
    mod.solver = "EXACT"
    apply_mods(door)
    bpy.data.objects.remove(cut, do_unlink=True)
door.data.materials.clear()
door.data.materials.append(clay_mat("stone"))
for p in door.data.polygons:
    p.material_index = 0
soften(door, bevel=0.007, segs=2, subd=0)
plate = box("plate", (0.17, 0.05, 0.34), loc=(LX, FRONT - 0.02, LZ), col=col, mat=clay_mat("warmgrey"),
            bevel=0.025, segs=3, subd=1)
hole_top = cyl("kh1", 0.035, 0.03, loc=(LX, FRONT - 0.05, LZ + 0.03), col=col, mat=clay_mat("charcoal"),
               verts=16, bevel=0.008, segs=1, subd=0, rot=(math.pi / 2, 0, 0))
hole_slot = box("kh2", (0.03, 0.03, 0.08), loc=(LX, FRONT - 0.05, LZ - 0.03), col=col, mat=clay_mat("charcoal"),
                bevel=0.008, segs=1, subd=0)
hardware = []
for z in (0.36, 1.72):
    for k in range(3):
        hardware.append(cyl("hinge", 0.036, 0.052,
                            loc=(-(IW / 2 - gap), FRONT - 0.006, z + 0.056 * (k - 1)),
                            col=col, mat=clay_mat("warmgrey"), verts=16, bevel=0.008, segs=2, subd=0))
for x in (LX - 0.13, LX + 0.02):
    hardware.append(cyl("handle_mount", 0.026, 0.08, loc=(x, FRONT - 0.055, 1.31),
                        col=col, mat=clay_mat("cream"), verts=16, bevel=0.008, segs=2, subd=0,
                        rot=(math.pi / 2, 0, 0)))
hardware.append(box("handle", (0.22, 0.045, 0.045), loc=(LX - 0.07, FRONT - 0.09, 1.31),
                    col=col, mat=clay_mat("cream"), bevel=0.015, segs=3, subd=0))
join([door, plate, hole_top, hole_slot] + hardware)
set_origin(door, (-(IW / 2 - gap), 0, 0))          # hinge on the left edge

# Key: bow (ring), shaft and bit; shaft points into the lock along +Y
KY = FRONT - 0.07
bpy.ops.mesh.primitive_torus_add(major_radius=0.11, minor_radius=0.04, major_segments=32, minor_segments=12,
                                 location=(LX, KY - 0.36, LZ + 0.03), rotation=(0, math.pi / 2, 0))
bow = bpy.context.active_object
for p in bow.data.polygons:
    p.use_smooth = True
bow.data.materials.append(clay_mat("mint"))
link(bow, col)
shaft = cyl("Key", 0.03, 0.3, loc=(LX, KY - 0.14, LZ + 0.03), col=col, mat=clay_mat("mint"), verts=12,
            bevel=0.012, segs=2, subd=1, rot=(math.pi / 2, 0, 0))
teeth = [box(f"t{i}", (0.03, 0.05, h), loc=(LX, KY - 0.03 - 0.06 * i, LZ + 0.03 - 0.03 - h / 2), col=col,
             mat=clay_mat("mint"), bevel=0.01, segs=2, subd=0) for i, h in enumerate((0.07, 0.045, 0.06))]
collar = cyl("collar", 0.05, 0.035, loc=(LX, KY - 0.27, LZ + 0.03), col=col, mat=clay_mat("mint"), verts=16,
             bevel=0.01, segs=2, subd=0, rot=(math.pi / 2, 0, 0))
# Three small spokes divide the existing open bow into a cut-out pattern.
bow_parts = []
for k in range(3):
    a = 2 * math.pi * k / 3
    spoke = box("bow_spoke", (0.035, 0.12, 0.025),
                loc=(LX, KY - 0.36 + 0.05 * math.cos(a), LZ + 0.03 + 0.05 * math.sin(a)),
                col=col, mat=clay_mat("mint"), bevel=0.009, segs=2, subd=0)
    spoke.rotation_euler.x = a
    bow_parts.append(spoke)
key = join([shaft, bow, collar] + teeth + bow_parts)
key.name = "Key"
set_origin(key, (LX, 0, LZ + 0.03))                 # turn about the keyhole axis (Blender Y)
key.scale = (1.6, 1.6, 1.6)                         # big enough to be the hero of the section
bpy.ops.object.select_all(action="DESELECT")
key.select_set(True)
bpy.context.view_layer.objects.active = key
# Bake the shaft orientation into the mesh so local Y remains the lock axis.
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
# Keep the enlarged shaft seated in the lock without moving its animation handle.
tip_shift = FRONT - 0.052 - max(v.co.y for v in key.data.vertices)
for v in key.data.vertices:
    v.co.y += tip_shift
key.parent = door
key.matrix_parent_inverse = door.matrix_world.inverted()

# What's behind the door: a mint floor tile, the space that is yours (seen once the door opens)
box("Inside", (1.0, 0.9, 0.06), loc=(0, DEPTH / 2 + 0.5, 0.03), col=col, mat=clay_mat("mint"), bevel=0.025, segs=3, subd=1)

print("tris", tri_count(col.objects), [o.name for o in col.objects])
