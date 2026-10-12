"""Headless build: model -> bake -> GLB -> preview -> stills, no Blender window or MCP needed.

  "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b --factory-startup -P blender/build.py -- loop stack
  options after the keys: --cpu (skip the GPU), --test (small fast stills), --no-bake (stills only)
"""
import bpy, sys, os, math

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
keys = [a for a in argv if not a.startswith("--")]
flags = {a for a in argv if a.startswith("--")}
if "--cpu" in flags:
    bpy.app.driver_namespace["clay_force_cpu"] = True

LIB = r"C:/Users/anuda/orca/loopstak/blender/"
for o in list(bpy.data.objects):                      # factory scene: cube, light, camera
    bpy.data.objects.remove(o, do_unlink=True)

# key: (script, texture px, skip, preview cam, preview target, [(still name, cam, target, lens, pose)])
MODELS = {
    "loop":  ("m_loop.py", 1024, (), (0, -5.0, 2.2), (0, 0, 0),
              [("loop", (0.0, -6.0, 2.9), (0, 0, -0.1), 50, None)]),
    "stack": ("m_stack.py", 1024, (), (3.2, -5.2, 4.2), (0, 0, 0.8),
              [("stack", (4.2, -6.0, 4.1), (0, 0, 0.75), 50, None)]),
    "gears": ("m_gears.py", 1024, (), (0, -6.0, 3.9), (0, 0, 0.2),
              [("gears", (0.0, -6.0, 3.8), (0, 0, 0.2), 34, None)]),
    "site":  ("m_site.py", 1024, (), (0, -3.6, 4.2), (0, 0, 0.1),
              [("site", (1.3, -3.6, 3.1), (0, -0.05, 0.1), 42, None)]),
    "plug":  ("m_plug.py", 1024, (), (0.9, -4.2, 2.6), (0, 0, 0.5),
              [("plug", (1.0, -4.4, 2.7), (0, 0, 0.5), 45, "plug_off"),
               ("plug-lit", (1.0, -4.4, 2.7), (0, 0, 0.5), 45, "plug_lit")]),
    "table": ("m_table.py", 1024, (), (3.0, -4.6, 3.2), (0.2, 0, 0.5),
              [("table", (2.6, -4.3, 2.8), (0.25, 0, 0.45), 40, None)]),
    "keys":  ("m_keys.py", 1024, (), (2.2, -4.6, 2.2), (0, 0, 1.1),
              [("keys-closed", (2.0, -5.0, 2.0), (0, 0, 1.15), 45, None),
               ("keys", (2.0, -5.0, 2.0), (0, 0, 1.15), 45, "keys_open")]),
    "frame": ("m_frame.py", 512, ("Screen",), (0.8, -3.6, 0.6), (0, 0, 0),
              [("frames", (0, -6.0, 1.0), (0, 0.3, 0), 38, "frames_row")]),
}


def pose(name, col, undo=False):
    """Temporary poses for stills (the GLB is always exported in its rest pose)."""
    ob = bpy.data.objects
    if name == "plug_off":
        for n in ("Block_A_Lit", "Block_B_Lit"):
            ob[n].hide_render = not undo
    elif name == "plug_lit":
        for n in ("Block_A", "Block_B"):
            ob[n].hide_render = not undo
    elif name == "keys_open":
        ob["Key"].rotation_euler = (0, 0 if undo else math.radians(90), 0)
        ob["Door"].rotation_euler = (0, 0, 0 if undo else math.radians(-72))
    elif name == "frames_row":
        border, screen = ob["Border"], ob["Screen"]
        if undo:
            for o in [o for o in col.objects if o.get("tmp_still")]:
                bpy.data.objects.remove(o, do_unlink=True)
            border.hide_render = screen.hide_render = False
            return
        for shot, x, rz in zip(["editedwild", "ramashala", "hyrefi"], (-2.0, 0, 2.0), (20, 0, -20)):
            b = border.copy(); col.objects.link(b)
            s = screen.copy(); s.data = screen.data.copy(); col.objects.link(s)
            m = bpy.data.materials.new("shot_" + shot); m.use_nodes = True
            nt = m.node_tree
            t = nt.nodes.new("ShaderNodeTexImage")
            t.image = bpy.data.images.load(ROOT + f"/public/work/{shot}.jpg", check_existing=True)
            em = nt.nodes.new("ShaderNodeEmission")
            nt.links.new(t.outputs["Color"], em.inputs["Color"])
            em.inputs["Strength"].default_value = 0.8
            out = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
            nt.links.new(em.outputs[0], out.inputs["Surface"])
            s.data.materials[0] = m
            for o in (b, s):
                o["tmp_still"] = True
                o.location = (x, abs(x) * 0.3, 0)
                o.rotation_euler = (0, 0, math.radians(rz))
        border.hide_render = screen.hide_render = True


for key in keys:
    script, tex, skip, pcam, ptarget, stills = MODELS[key]
    exec(open(LIB + "clay_lib.py").read())
    reset_materials()
    if "--no-bake" in flags:
        exec(open(LIB + script).read())
    else:
        KEY, SCRIPT, PREVIEW_CAM, PREVIEW_TARGET, TEX, SKIP = key, script, pcam, ptarget, tex, skip
        exec(open(LIB + "run_model.py").read())
    col = bpy.data.collections["M_" + key]
    for name, cam, target, lens, p in stills:
        if p:
            pose(p, col)
        res, spp = ((1000, 750), 64) if "--test" in flags else ((2000, 1500), 320)
        print("still", render_still(col, name.replace("-", "_") + ("_test" if "--test" in flags else ""),
                                    cam, target, lens=lens, res=res, samples=spp))
        if p:
            pose(p, col, undo=True)
    print("done", key)
