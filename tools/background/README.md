# Planet backgrounds

Planet pages use `media/planets/<planet>_hd.jpg` (3000x2000).

In-game method (Geonosis, Mustafar): take an in-game screenshot of the planet, paint out
each mission marker by seamless-cloning a nearby patch over it (OpenCV `seamlessClone`, with the
patch area a little larger than the marker), crop or pad to 3:2, upscale to 3000x2000 with a light
unsharp mask, then set each mission icon's `top`/`left` % in `css/<planet>.css` to the marker centre:
`left = x/W - 2.5%`, `top = y/H - 3.75%` (icons are 5% wide on a 3:2 map).

`make_planet_bg.py` builds a background from a large clean planet image instead.
`make_bg.py` builds the overview map background.
