---
layout: Post
title: Flexbox Techniques
author: Desmond
date: 2021-01-02 16:32:50
useHeaderImage: true
headerImage: https://6772-grp2020-4glv8fo5cd87cf9a-1302562267.tcb.qcloud.la/head-images/IMG_1100(20200922-095846).JPG?sign=4dde0a7588c5e34507ee6ddba009f992&t=1653750367
headerMask: rgba(45, 55, 71, .5)
permalinkPattern: /post/:year/:month/:day/:slug/
tags: [CSS]
---

#### Creating Equal Height Columns

This may not seem like a difficult task at first, but making columns that have the same height can be really annoying. Simply setting `min-height` won't work, because once the amount of content in the columns starts to differ, some of them will grow and others will remain shorter.

Fixing this issue using flexbox couldn't be easier, as columns created this way have equal heights by default. All we have to do is initialize the flex model, then make sure the [flex-direction](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-direction) and [align-items](https://developer.mozilla.org/en-US/docs/Web/CSS/align-items) properties have their default values.

```html
<div class="container">
  <!-- Equal height columns -->

  <div>...</div>
  <div>...</div>
  <div>...</div>
</div>
```

```css
.container {
  /* Initialize the flex model */
  display: flex;

  /* These are the default values but you can set them anyway */
  flex-direction: row; /* Items inside the container will be positioned horizontally */
  align-items: stretch; /* Items inside the container will take up it's entire height */
}
```

To see a demo of this technique, you can head out to our [Easiest Way To Create Equal Height Sidebars](https://tutorialzine.com/2014/10/easiest-way-equal-height-sidebar/) article, in which we create a responsive page with a sidebar and main content section.

#### Creating Fully Responsive Grids

A row in the flexbox grid is simply a container with `display:flex`. The horizontal columns inside it can be any amount of elements, setting the size of which is done via [flex](https://developer.mozilla.org/en-US/docs/Web/CSS/flex). The flex model adapts to the viewport size, so this setup should look fine on all devices. However, if we decide there isn't enough space horizontally on the screen, we can easily turn the layout into a vertical one with a media-query.

```css
.container {
  display: flex;
}

/* Classes for each column size. */

.col-1 {
  flex: 1;
}

.col-2 {
  flex: 2;
}

@media (max-width: 800px) {
  .container {
    /* Turn the horizontal layout into a vertical one. */
    flex-direction: column;
  }
}
```

You can check out a variation of this technique in our [The Easiest Way To Make Responsive Headers](https://tutorialzine.com/2016/02/quick-tip-easiest-way-to-make-responsive-headers/) Quick Tip.

#### Creating The Perfect Sticky Footer

Applying `display: flex` to the body tag allows us to construct our entire page layout using flex mode properties. Once that's done the main content of the website can be one flex item and the footer another, which makes it really easy to manipulate their positioning and place them exactly where we want.

```css
header {
  /* We want the header to have a static height, 
   it will always take up just as much space as it needs.  */
  /* 0 flex-grow, 0 flex-shrink, auto flex-basis */
  flex: 0 0 auto;
}

.main-content {
  /* By setting flex-grow to 1, the main content will take up 
   all of the remaining space on the page. 
   The other elements have flex-grow: 0 and won't contest the free space. */
  /* 1 flex-grow, 0 flex-shrink, auto flex-basis */
  flex: 1 0 auto;
}

footer {
  /* Like the header, the footer will have a static height - it shouldn't grow or shrink.  */
  /* 0 flex-grow, 0 flex-shrink, auto flex-basis */
  flex: 0 0 auto;
}
```

You can find more information about this technique in our article [The Best Way To Make Sticky Footers](https://tutorialzine.com/2016/03/quick-tip-the-best-way-to-make-sticky-footers/).
