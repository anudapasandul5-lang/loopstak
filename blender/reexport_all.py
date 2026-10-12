"""Re-export every model from its existing bake (no re-bake). Run in Blender after clay_lib changes."""
exec(open(r"C:/Users/anuda/orca/loopstak/blender/clay_lib.py").read())
SKIPS = {"frame": ("Screen",)}
for key in ("loop", "stack", "gears", "site", "plug", "table", "keys", "frame"):
    col = bpy.data.collections["M_" + key]
    skip = SKIPS.get(key, ())
    objs = [o for o in col.objects if o.type == "MESH" and o.name not in skip]
    img = bpy.data.images[key + "_bake"]
    export_model(col, key, img, objs, extra=[bpy.data.objects[n] for n in skip])
    print(key, sorted(o.name for o in col.objects))
