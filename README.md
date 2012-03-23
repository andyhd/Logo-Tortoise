# Logo Tortoise #

## What is this? ##

The thing that got me interested in programming way back in 1987 was the BBC
Micro that sat in my primary school classroom. One day, the teacher hooked it
up to a robot "turtle", which held a pen over a large sheet of paper on the
ground and could be made to move around and draw by way of writing programs on
the computer.

This repository is a attempt to recreate the magical experience I had that day.

## What can I do with it? ##

This is still unfinished, but you can draw pictures using Logo programs that
you can type into the area at the bottom of the page. An example program is
preloaded.

The interpreter understands the following keywords:

<dl>
  <dt><code>forward <var>x</var></code></dt>
  <dd>Move forward <var>x</var> steps</dd>
  <dt><code>right <var>x</var></code></dt>
  <dd>Turn right <var>x</var> degrees</dd>
  <dt><code>left <var>x</var></code></dt>
  <dd>Turn left <var>x</var> degrees</dd>
  <dt><code>penup</code></dt>
  <dd>Stop drawing lines when moving</dd>
  <dt><code>pendown</code></dt>
  <dd>Start drawing lines when moving</dd>
  <dt><code>repeat <var>x</var> [ <var>instructions</var> ]</code></dt>
  <dd>Repeat <var>instructions</var> <var>x</var> times</dd>
  <dt><code>to <var>verb</var> <var>parameters</var> <var>instructions</var> end</code></dt>
  <dd>Defines the function <var>verb</var>, optionally taking <var>parameters</var> listed in the form <code>:x</code>, so that you can subsequently write <code><var>verb</var></code> and <var>instructions</var> will be performed</dd>
  <dd>Eg: <pre>to square :x repeat 4 right 90 forward :x end
square 20</pre></dd>
  <dt><code>if <var>expression</var> [ <var>instructions</var> ]</code></dt>
  <dd>Performs <var>instructions</var> if <var>expression</var> evaluates to true</dd>
</dl>

Currently, expressions are only accepted by the `if` keyword, so you can't do `forward 1 + 1`, for example.

## Why are you calling it a tortoise? ##

Because turtles are aquatic. Artistic tortoises make more sense to me.

## It doesn't work ##

Yeah, I've only tested it in Chrome, Firefox 7 and Safari 5 so far. It's a work in progress.
