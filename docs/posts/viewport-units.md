---
layout: Post
title: Viewport Units
subtitle: vh, vw, vmin, vmax
author: Desmond
date: 2021-01-02 16:46:08
useHeaderImage: true
headerImage: https://i.loli.net/2021/01/02/mkt29yaKePEhnwL.jpg
headerMask: rgba(45, 55, 71, .5)
permalinkPattern: /post/:year/:month/:day/:slug/
tags: [CSS]
---

The viewport is the area of your browser where actual content is displayed - in other words your web browser without its toolbars and buttons. The units are **vw**, **vh**, **vmin** and **vmax**. They all represent a percentage of the browser (viewport) dimensions and scale accordingly on window resize.

Lets say we have a viewport of 1000px (width) by 800px (height):

- **vw** - Represents 1% of the viewport's width. In our case 50vw = 500px.
- **vh** - A percentage of the window's height. 50vh = 400px.
- **vmin** - A percentage of the minimum of the two. In our example 50vmin = 400px since we are in landscape mode.
- **vmax** - A percentage of the bigger dimension. 50vmax = 500px.

You can use these units anywhere that you can specify a value in pixels, like in `width`, `height`, `margin`, `font-size` and more. They will be recalculated by the browser on window resize or device rotation.

#### Taking up the full height of the page

Every frontend developer has struggled with this at one point or another. Your first instinct is to do something like this:

```css
#elem {
  height: 100%;
}
```

However, this won't work unless we add a height of 100% to the **body** and **html** as well, which isn't very elegant and might break the rest of your design. With **vh** that's pretty easy. Just set its height to **100vh** and it will always be as tall as your window.

```css
#elem {
  height: 100vh;
}
```

#### Child size relative to the browser, not the parent

In certain situations, you'd want to size a child element relative to the window, and not its parent. Similarly to the previous example, this won't work:

```css
#parent {
  width: 400px;
}
#child {
  /* This is equal to 100% of the parent width, not the whole page. */
  width: 100%;
}
```

If we use **vw** instead our child element will simply overflow it's parent and take up the full width of the page:

```css
#parent {
  width: 400px;
}
#child {
  /* This is equal to 100% of page, regardless of the parent size. */
  width: 100vw;
}
```

#### Responsive font size

Viewport units can be used on text too! In this example we've set the font size be in **vw** creating awesome text responsiveness in one line of CSS. Goodbye [Fittext](http://fittextjs.com/)!

```css
h2.responsive-text {
  font-size: 6vw;
}
h4.responsive-text {
  font-size: 3vw;
}
```

#### Responsive vertical centering

By setting an element's width, height and margins in viewport units, you can center it without using any other tricks.

Here, this rectangle has a height of **60vh** and top and bottom margins of **20vh**, which adds up to a **100vh** (60 + 2\*20) making it always centered, even on window resize.

```css
#rectangle {
  width: 60vw;
  height: 60vh;
  margin: 20vh auto;
}
```
