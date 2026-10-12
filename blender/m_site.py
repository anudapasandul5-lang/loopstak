"""Website design: a clay web page that assembles piece by piece.
Nodes (lying flat, page top = +Y in Blender = -Z in glTF): Base, Bar, Title, Subtitle, Button (mint), Picture, Card_1..Card_3.
Rest pose = assembled; each part's pivot is its own centre, so parts can drop onto the Base."""
exec(open(r"C:/Users/anuda/orca/loopstak/blender/clay_lib.py").read())

col = fresh_collection("M_site")
BT = 0.14            # base thickness
PT = 0.09            # part thickness
top = BT + PT / 2


def part(name, w, h, x, y, key, bevel=0.035):
    return box(name, (w, h, PT), loc=(x, y, top), col=col, mat=clay_mat(key), bevel=bevel, segs=3, subd=1)


box("Base", (2.6, 1.8, BT), loc=(0, 0, BT / 2), col=col, mat=clay_mat("charcoal"), bevel=0.06, segs=4, subd=1)

# browser bar with three dots
bar = part("Bar", 2.36, 0.18, 0, 0.73, "warmgrey")
dots = [sphere(f"Bar_dot{i}", 0.035, loc=(-1.06 + 0.1 * i, 0.73, top + PT / 2), col=col, mat=clay_mat("sand"), seg=12, rings=6)
        for i in range(3)]
bpy.ops.object.select_all(action="DESELECT")
for d in dots:
    d.select_set(True)
bar.select_set(True)
bpy.context.view_layer.objects.active = bar
bpy.ops.object.join()

part("Title", 1.0, 0.16, -0.62, 0.38, "cream")
part("Subtitle", 0.7, 0.1, -0.77, 0.16, "sand")
part("Button", 0.44, 0.16, -0.89, -0.06, "mint", bevel=0.07)
part("Picture", 0.9, 0.62, 0.62, 0.21, "stone")
for i in range(3):
    part(f"Card_{i + 1}", 0.7, 0.44, -0.77 + 0.77 * i, -0.5, "sand" if i != 1 else "stone")

print("tris", tri_count(col.objects), [o.name for o in col.objects])
