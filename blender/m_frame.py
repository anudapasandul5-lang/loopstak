"""Work section: one clay picture frame for a 16:10 site screenshot. Reuse it for every project card.
Nodes: Border (baked clay border + back), Screen (flat panel, UV 0-1, material "screen": put the screenshot here).
Upright, facing the viewer (-Y in Blender = +Z in glTF), centred on the origin."""
exec(open(r"C:/Users/anuda/orca/loopstak/blender/clay_lib.py").read())

col = fresh_collection("M_frame")
SW, SH = 1.6, 1.0           # screen (16:10)
B = 0.13                    # border width
D = 0.14                    # frame depth


def join(objs):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    return objs[0]


ow, oh = SW + 2 * B, SH + 2 * B
parts = [
    box("Border", (B, D, oh), loc=(-(SW + B) / 2, 0, 0), col=col, mat=clay_mat("stone"), bevel=0.05, segs=3, subd=1),
    box("fr", (B, D, oh), loc=((SW + B) / 2, 0, 0), col=col, mat=clay_mat("stone"), bevel=0.05, segs=3, subd=1),
    box("ft", (ow, D, B), loc=(0, 0, (SH + B) / 2), col=col, mat=clay_mat("stone"), bevel=0.05, segs=3, subd=1),
    box("fb", (ow, D, B), loc=(0, 0, -(SH + B) / 2), col=col, mat=clay_mat("stone"), bevel=0.05, segs=3, subd=1),
    box("back", (SW + 0.04, 0.04, SH + 0.04), loc=(0, D / 2 - 0.03, 0), col=col, mat=clay_mat("charcoal"), bevel=0.01, segs=1, subd=0),
]
border = join(parts)
set_origin(border, (0, 0, 0))

bpy.ops.mesh.primitive_plane_add(size=1, location=(0, D / 2 - 0.06, 0), rotation=(math.pi / 2, 0, 0))
scr = bpy.context.active_object
scr.name = "Screen"
scr.data.name = "Screen"
scr.scale = (SW, SH, 1)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
m = bpy.data.materials.get("screen") or bpy.data.materials.new("screen")
m.use_nodes = True
bsdf = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
bsdf.inputs["Base Color"].default_value = hex_rgba("#242424")
bsdf.inputs["Roughness"].default_value = 0.6
scr.data.materials.append(m)
link(scr, col)

print("tris", tri_count(col.objects), [o.name for o in col.objects])
