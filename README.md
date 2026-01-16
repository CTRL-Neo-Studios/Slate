# Slate

> [!WARNING]
> 
> This project is deprecated. Please go check out our new Markdown Editor, [Vertex](https://github.com/CTRL-Neo-Studios/vertex).

Slate is a WYSIWYG Text Editing Software with a simplistic touch to it.

## Issues in Dev
`pnpm run tauri:build` ends with error usually regarding pro-macro and stuff:
1. Run `which strip`
2. Check the strip directory, see if its your default computer bin strip directory
3. If it isn't remove it (for my case, mine was anaconda, which i removed)
4. Or if you have brew, run `brew uninstall binutils`
5. Then run the build command again.

Having the wrong strip and binutils in your mac will cause this annoying issue.
In my case, it wasn't about having binutils installed, but rather having anaconda
installed. Honestly, anaconda is very effing annoying and I've had many issues with
it so I'm glad I deleted it.
