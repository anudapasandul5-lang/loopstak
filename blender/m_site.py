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
button = part("Button", 0.44, 0.16, -0.89, -0.06, "mint", bevel=0.07)
picture = part("Picture", 0.9, 0.62, 0.62, 0.21, "stone")


def relief(owner, marks):
    bpy.ops.object.select_all(action="DESELECT")
    for o in [owner] + marks:
        o.select_set(True)
    bpy.context.view_layer.objects.active = owner
    bpy.ops.object.join()


z = top + PT / 2 + 0.013
relief(button, [box("button_label", (0.23, 0.035, 0.025), loc=(-0.89, -0.06, z),
                    col=col, mat=clay_mat("cream"), bevel=0.01, segs=2, subd=0)])
sun = cyl("sun", 0.075, 0.025, loc=(0.82, 0.36, z), col=col,
          mat=clay_mat("cream"), verts=24, bevel=0.008, segs=2, subd=0)
# Rounded low hills contained inside the picture tile.
hills = []
for x, y, sx, sy in ((0.46, 0.1, 0.23, 0.14), (0.73, 0.05, 0.25, 0.12)):
    hill = sphere("hill", 1, loc=(x, y, z - 0.01), col=col,
                  mat=clay_mat("sand"), seg=20, rings=10)
    hill.scale = (sx, sy, 0.035)
    bpy.context.view_layer.objects.active = hill
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    hills.append(hill)
relief(picture, [sun] + hills)
for i in range(3):
    x = -0.77 + 0.77 * i
    card = part(f"Card_{i + 1}", 0.7, 0.44, x, -0.5, "sand" if i != 1 else "stone")
    marks = [box(f"card{i}_line{k}", (w, 0.035, 0.025),
                 loc=(x - (0.46 - w) / 2, -0.41 - 0.09 * k, z), col=col,
                 mat=clay_mat("cream" if k == 0 else "warmgrey"), bevel=0.009, segs=2, subd=0)
             for k, w in enumerate((0.46, 0.42, 0.3))]
    relief(card, marks)

print("tris", tri_count(col.objects), [o.name for o in col.objects])
