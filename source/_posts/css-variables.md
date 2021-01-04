---
title: CSS Variables
author: Desmond
catalog: true
abbrlink: 5c38763b
date: 2021-01-02 16:41:16
header-img: https://i.loli.net/2021/01/02/9a3xN71dOZ2EGXn.jpg
tags: CSS
top:
---

#### Defining And Using CSS Variables

Variables follow the same scope and inheritance rules like any other CSS definition. The easiest way to use them, is to make them globally available, by adding the declarations to the `:root` pseudo-class, so that all other selectors can inherit it.

```css
:root{
    --awesome-blue: #2196F3;
}
```

To access the value inside a variable we can use the `var(...)` syntax. Note that names are case sensitive, so `--foo != --FOO`.

```css
.some-element{
    background-color: var(--awesome-blue);
}
```

#### Theme Colors

Variables in CSS are most useful when we need to apply the same rules over and over again for multiple elements, e.g. the repeating colors in a theme. Instead of copy-and-pasting every time we want to reuse the same color, we can place it in a variable and access it from there.

Now, if our client doesn't like the shade of blue we've chosen, we can alter the styles in just one place (the definition of our variable) to change the colors of the whole theme. Without variables we would have to manually search and replace for every single occurrence.

```css
:root{
    --primary-color: #B1D7DC;
    --accent-color: #FF3F90;
}

html{
    background-color: var(--primary-color);
}

h3{
    border-bottom: 2px solid var(--primary-color);
}

button{
    color: var(--accent-color);
    border: 1px solid var(--accent-color);
}
```

#### Human Readable Names For Properties

Another great use of variables is when we want to save a more complex property value, so that we don't have to remember it. Good examples are CSS rules with multiple parameters, such as `box-shadow`, `transform` and `font`.

By placing the property in a variable we can access it with a semantic, human readable name.

```css
:root{
    --tiny-shadow: 0 2px 1px 0 rgba(0, 0, 0, 0.2);
    --animate-right: translateX(20px);
}
li{
    box-shadow: var(--tiny-shadow);
}
li:hover{
    transform: var(--animate-right);
}
```

#### Dynamically Changing Variables

When a custom property is declared multiple times, the standard cascade rules help resolve the conflict and the lowermost definition in the stylesheet overwrites the ones above it.

The example below demonstrates how easy it is to dynamically manipulate properties on user action, while still keeping the code clear and concise.

```css
.blue-container{
    --title-text: 18px;
    --main-text: 14px;
}
.blue-container:hover{
    --title-text: 24px;
    --main-text: 16px;
}
.green-container:hover{
    --title-text: 30px;
    --main-text: 18px;
}
.title{
    font-size: var(--title-text);
}
.content{
    font-size: var(--main-text);
}
```

As you can see CSS variables are pretty straightforward to use and it won't take much time for developers to start applying them everywhere. Here are a few more things we left our of the article, but are still worth mentioning:

- The var() function has a second parameter, which can be used to supply a fallback value if the custom property fails:
  
  ```css
  width: var(--custom-width, 20%);
  ```

- It is possible to nest custom properties:
  
  ```css
  --base-color: #f93ce9;
  --background-gradient: linear-gradient(to top, var(--base-color), #444);
  ```