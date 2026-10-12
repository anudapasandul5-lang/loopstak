"""Build, bake, export and preview one model.
Set before exec: KEY, SCRIPT, PREVIEW_CAM, PREVIEW_TARGET, optional TEX (1024), SKIP, GROUPS."""
exec(open(r"C:/Users/anuda/orca/loopstak/blender/" + SCRIPT).read())
_col = bpy.data.collections["M_" + KEY]
_img, _objs = bake_model(_col, KEY, size=globals().get("TEX", 1024), samples=96,
                         skip=globals().get("SKIP", ()), groups=globals().get("GROUPS"))
_extra = [bpy.data.objects[n] for n in globals().get("SKIP", ())]
_p = export_model(_col, KEY, _img, _objs, extra=_extra)
print(preview_glb(_p, KEY, PREVIEW_CAM, PREVIEW_TARGET))
