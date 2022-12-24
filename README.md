# Periodic Table Widget

## Static images

<img src="https://qwizcards.net/wp-content/uploads/2022/12/periodic_table_initial.jpg" width="360" /> <img src="https://qwizcards.net/wp-content/uploads/2022/12/period_table_click.jpg" width="360" />

## Demo

   https://qwizcards.net/periodic-table-widget

## Installation

Example shown in index.html.

In brief, need jQuery:

```javascript
   <script src="https://code.jquery.com/jquery-3.6.3.min.js"></script>
   <script src="https://code.jquery.com/ui/1.13.2/jquery-ui.min.js"></script>
   <link rel="stylesheet" href=" https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css">
```
and scripts/css from repo:
```javascript
   <script src="qwiz_periodic_table.js"></script>
   <script src="qwiz_zoom.js"></script>
   <link rel="stylesheet" href="qwiz_periodic_table.css">
```

In the body, create the link something like this:
```html
   <span style="display: inline-block;" onclick="q_periodic_table_.init (this)">
      <a href="#">
         Pop-up periodic table
      </a>
   </span>
```


