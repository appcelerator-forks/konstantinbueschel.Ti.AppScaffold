# Introduction

This file contains hints for "**Titanium Development**". The content is split by headlines like Tools > Tool #1, UI Components > View, Modules > Module #1 etc.

# Tools

# Modules

## Common
+ If a module causing license violation, try to open the modules "**manifest**" file and change the "**guid**" field to the apps "**guid**" from "**tiapp.xml**". In most cases this should solve the problem.

### so.hau.tomas.pager - Android ViewPager module
+ This module is one of that, that causes license violation. To fix see Modules > Common section upwards.

# UI Components

## iOS

### WebView

+ If the WebView component is within multiple parent views and doesn't response to touch events, try to set "**zIndex**" property. This should solve the problem. If this does not help, try to set "**width & height**" properties for the WebView and the direct parent of it.

### TableView

+ **Hiding a table view row** is only possible if you remove/add the row. Setting row properties like height = 0, visible = false or use the methods hide/show does nothing to the table view row.

## Android
### TableView

+ TableView on Android has no selected state. If you mark it as selected or execute the selectRow method, TableView only scrolls to this row without selecting it or mark it as selected.