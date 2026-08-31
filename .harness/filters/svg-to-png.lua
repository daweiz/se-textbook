-- svg-to-png.lua
-- 仅用于 LaTeX 输出：把引用 .svg 的图片路径替换为同名 .png，
-- 使 HTML 保持 SVG 矢量、xelatex 编译使用 PNG（本环境缺少 rsvg-convert/inkscape）。
-- 用法：pandoc ... --lua-filter=.harness/filters/svg-to-png.lua

local function replace_svg(elem)
  if elem.src and elem.src:match("%.svg$") then
    elem.src = elem.src:gsub("%.svg$", ".png")
  end
  return elem
end

return {
  { Image = replace_svg }
}
