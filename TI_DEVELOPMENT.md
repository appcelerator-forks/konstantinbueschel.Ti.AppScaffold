# Introduction

This file contains hints for **Titanium Development**. The content is split by headlines like Tools, UI Components > View etc.

<p>&nbsp;</p>

# Tools

<p>&nbsp;</p>

# UI Components

## WebView

+ If the WebView component is within multiple parent views and doesn't response to touch events, try to set "**zIndex**" property. This should solve the problem. If this does not help, try to set "**width & height**" properties for the WebView and the direct parent of it.