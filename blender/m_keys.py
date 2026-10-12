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
frame = join([jl, jr, li])

# Door with a lock plate and a dark keyhole
gap = 0.025
door = box("Door", (IW - 2 * gap, DT, IH - gap), loc=(0, 0, (IH - gap) / 2), col=col, mat=clay_mat("stone"),
           bevel=0.04, segs=3, subd=1)
LX, LZ = IW / 2 - 0.2, 1.02             # lock position on the door front
FRONT = -DT / 2
plate = box("plate", (0.17, 0.05, 0.34), loc=(LX, FRONT - 0.02, LZ), col=col, mat=clay_mat("warmgrey"),
            bevel=0.025, segs=3, subd=1)
hole_top = cyl("kh1", 0.035, 0.03, loc=(LX, FRONT - 0.05, LZ + 0.03), col=col, mat=clay_mat("charcoal"),
               verts=16, bevel=0.008, segs=1, subd=0, rot=(math.pi / 2, 0, 0))
hole_slot = box("kh2", (0.03, 0.03, 0.08), loc=(LX, FRONT - 0.05, LZ - 0.03), col=col, mat=clay_mat("charcoal"),
                bevel=0.008, segs=1, subd=0)
join([door, plate, hole_top, hole_slot])
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
key = join([shaft, bow, collar] + teeth)
key.name = "Key"
set_origin(key, (LX, 0, LZ + 0.03))                 # turn about the keyhole axis (Blender Y)
key.scale = (1.6, 1.6, 1.6)                         # big enough to be the hero of the section
bpy.ops.object.select_all(action="DESELECT")
key.select_set(True)
bpy.context.view_layer.objects.active = key
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
key.parent = door
key.matrix_parent_inverse = door.matrix_world.inverted()

# What's behind the door: a mint floor tile, the space that is yours (seen once the door opens)
box("Inside", (1.0, 0.9, 0.06), loc=(0, DEPTH / 2 + 0.5, 0.03), col=col, mat=clay_mat("mint"), bevel=0.025, segs=3, subd=1)

print("tris", tri_count(col.objects), [o.name for o in col.objects])
