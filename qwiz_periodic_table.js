// =============================================================================
// Isolate namespace.
q_periodic_table_ = {};
var q_periodic_tablef = function () {
   var $ = jQuery;

   // Private globals.
   const debug = false;
   const q = this;
   var   $q_periodic_table_dialog;
   var   $q_periodic_table;
   var   $q_periodic_table_large;
   var   $current_table;
   var   q_periodic_table_zoomarea;
   var   $current_cells;
   var   fit_zoomLevel;

   // ---------------------------------------------------------------------------
   this.init = function (link_el) {
      if (debug) {
         console.log ('[test_init] link_el:', link_el);
      }
      if (! $q_periodic_table_dialog) {

         // Create dialog and tables.  Add dialog to body.
         const dialog_htm = q_periodic_table_dialog ();
         $ ('body').css ({position: 'relative'}).append (dialog_htm);
         $q_periodic_table_dialog = $ ('div#q_periodic_table_dialog');

         // Make dialog draggable, resizable.
         $q_periodic_table_dialog
            .draggable ({
               handle:  '#q_periodic_table_dialog_handle'
            })
            .resizable ();
      }

      // Position dialog at link and show in case hidden.
      const link_rect = link_el.getBoundingClientRect ();
         $q_periodic_table_dialog.css ({left: link_rect.left, top: link_rect.top}).show ();

         // Set up tables inside dialog.
         $q_periodic_table       = $ ('div#q_periodic_table');
         $q_periodic_table_large = $ ('div#q_periodic_table_large');
         $current_table          = $q_periodic_table;

         var table_htm = q_periodic_table ();
         $q_periodic_table.html (table_htm);

         table_htm = q_periodic_table ('periodic_table_large');
         $q_periodic_table_large.html (table_htm);

         // ZoomArea - in qwiz_zoom.js.
         const initial_zoom = 1.0;
         q_periodic_table_zoomarea = $('.qwiz-zoom-container-inner').ZoomArea ({
            zoomLevel:           initial_zoom,
            left:                0, // -25,
            top:                 0, // -35,
            minZoomLevel:        initial_zoom,
            maxZoomLevel:        15,
            parentOverflow:      'auto',
            externalIncrease:    '.qwiz-zoom-control-zoom-in',
            externalDecrease:    '.qwiz-zoom-control-zoom-out',
            virtualScrollbars:   false,
            usedAnimateMethod:   'none',
            onAfterDrag:         q_periodic_table_drag,
            onAfterZoom:         q_periodic_table_zoom
         });
         q.q_periodic_table_zoomarea = q_periodic_table_zoomarea;

         // Save zoom-to-fit zoomLevel.
         fit_zoomLevel = q_periodic_table_zoomarea.settings.zoomLevel;

         // Each element box is clickable (zooms to that element).
         $ ('table.q_periodic_table td.element_box').on ('click', q.zoom_to);

         // Dialog header/zoom controls -- add find-elements dropdown.
         q_hover_select_.init ('q_periodic_table_dialog_search_by_symbol',
                               q_periodic_table_.element_symbols.slice (1),
                               135, 35, select_item_click, select_item_mouseenter,
                               select_item_mouseleave);
         var element_names = [];
         const element_data = q_periodic_table_.element_data;
         for (const element_symbol in element_data) {
            element_names.push (element_data[element_symbol][0]);
         }
         q_hover_select_.init ('q_periodic_table_dialog_search_by_name',
                               element_names.slice (1), 70, 5, select_item_click,
                               select_item_mouseenter, select_item_mouseleave);
      }


      // ---------------------------------------------------------------------------
      function q_periodic_table_dialog () {

      var htm = `
         <div id="q_periodic_table_dialog">
            <div id="q_periodic_table_dialog_header">
               <div id="q_periodic_table_dialog_handle">
               </div>
               <div id="q_periodic_table_dialog_search">
                  Find by
                  <div id="q_periodic_table_dialog_search_by_symbol">
                     <u>symbol</u>
                  </div>
                  or
                  <div id="q_periodic_table_dialog_search_by_name">
                     <u>name</u>
                  </div>
                  <img id="q_periodic_table_dialog_exit" src="data:image/png;base64,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" 
                       onclick="q_periodic_table_.q_periodic_table_dialog_exit ()" />
               </div>
               <img src="data:image/png;base64,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"
                    class="qwiz_periodic_table_info" title="Click an element box for details" />

               <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAABJ0AAASdAHeZh94AAAD0klEQVRYhcWWXYhVVRTHf/9z57Mm+4BCTWusMSyihyDLCHSMICLqoRKzh94szSBBjJvpvjsbzXzKCSqip4ypTIgyE7EPLAgskAh9EEkrHUJppGGwm3fm/nu4x/E6zL33jNa0XvbZh/9a67fX2XudrULB/J/W1EiwaZMuLxZ5GFhgczPoKvAw0C+xH9gJ7A3B5QsBUK0KxKgrbNYATwMdABIlm1NAk8SVNkrlh6RcDGGkDzyhko4LEKPusekDZgDHpORtKH8ybRoHli51CUYrM8/mcWAx0ALskKY8GcKfAxcMEKMesNlO5fO8Ik3fGMLx0/WCxKibbN4CFkj81NLCvfm8T04YIEbdbvMNgJR7LIThnVlXEmN3E3y9xWaZxHfAghB8ppFfcvaht1etNu8BbVLuiYkkBwjhq2EorADet5lnszaL3yjAwECyDJgDvBnC8McTSX4OIpQlngKOAat6ejQzE0CMSqD8HDDU2sq6WuIYdUmhkPwYo16vDeFBKReAtlKJFZkAgLk210tsz+f9R329b7OZVS/olCkjfcAg8GhWgLvTcXcjhyy2cqX/AvYCN8So6fW0TQA2N6bzg2MFMeoW4DoAiXYbJK6OUfdXyfaF4PPOvsQBmwehqQvorwsgcVmlf7UNjqNZbvNMCko63gF8XpVsfrriKksGoQy4o1byUQCgCJAkxfZxNDskfk+fW9LjdUji3SrN0bFOdjmNNVLMAnAUoFxmNnCgWhCCdwG7AGJUB7AWOByCX64XWGK2Dbkcv9TTnd2E+yrUdNcTZ7Vt25SzNV/i5MhI4UgGgM5vJU4Bi2JU28UCHDzIfeCpNp+GEOr+phOAEI4Ubd4BpgLLa4lD8JA0/VKp85FamhiV2AQQUvMbjWBHW3FrK68CAzYxPXo1II6fDuFInY2VrALuAn0YwpkfMgPk8z6ZJCwHdQA7YlRnI+exFqOWQHkD0C+Vn83ik1RP1q3zB5Kft5ll832Meihj4rZCQZuBrTY5ib+BTHup1o1oKbDFphXYLeV6YeaesaWPUddAstgurwQ6gUPAHir76GeJ7hD864QB0uC32noNvDB9dZpKqz5BpX90Al1AAipK7gVeCsFDhYLWAy9mgagJcA6kZS6UltjqBuaAWwAkTtnsl/gM2BqCT1T7FQq59VBuCNEQ4HwYNQEd7e2MrF7NUKMbcIzaYJMHDjc3s3DNGv92UQAXYo0gkhp+/5qF4BckNgJdpRJfjr2m/ecA40HEqBmTClAFsRnosvmip0fXTipACrG6AqGu4WHmTTrAOQjfGYI/gkk4BY3sHwi+oRdJ3FubAAAAAElFTkSuQmCC"
                    class="qwiz-zoom-control qwiz-zoom-control-zoom-in" title="Zoom in (or use mousewheel)" />
               <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAABJ0AAASdAHeZh94AAADoElEQVRYhcWWTWxUVRiGn/dO6bSmIrowgKBVi0HjygVaY0KLcWOMbtQgLtxVQUxsQmpGlDNHUhBZSRdqjDsMKpIYRUII/gRNTNCEhYEFMRYViaGxjbXBkZne18UMdGja+Wm1fpt778n7fe9zzj1/yufN/xkt9QS7dumaQoFHgB6b20HXgUvAOYkTwCHgWAhO5wKg2UYgRi2x2Qo8A3QASBRtxoAWiWttVJGfljIxhMl94KaGdEaAGHWfzT5gBXBWSt6G9ONlyzjZ1+ciXB6ZbpsngPVAK3BQWvxUCH+MzhkgRj1oc4Dy73lVWr4zhF8v1CoSo26zeQvokfi+tZX7czmPNA0Qo+6y+QpAyjwWQulQoz2JsbcFvtxjs1HiG6AnBF+sl5dcehkaUtbmXaBNyjzZjDlACF+UIL8ZeM+m2+blRvIuA4yOJhuB1cCbIZQ+asZ8CiKkEk8DZ4Etg4Na2RBAjEogfR6YyGbZNhfzKQiPS5kAtBWLbG4IAFhjc5PEgVzOv88HAGDx4sl9wDjwaKMA91aeR+ZrDtDf77+AY8AtMWp5LW0LgM2tle9T0wUx6g7gxqqmq4CLQKmq7XgIvmLtS5y0eQhauoBzNQEkri7vX23jM2g22TxbqxcSayn3uCqScUgBd9TKvXQWFACSpNA+g+agxG8VI6UpS6TkT0irR+DM9CQ7rdSaLDQCcAYgTVkFnKwWhODDwOFaRWYKiVU2ZDL8VEt3aRIeB7DpbdZopti/XxlbayVGJifzww0AdH4tMQY8HqPa5gtw6hQPgJfafBJCqHlMJwAhDBds3gGWApvmYx6jEpsAQlr0Rj395a04m+U1YNQmVpbeHCPZAtwD+iCEi981DJDLeSRJ2ATqAA7GqM5mrWPUBkh3AOek9LmGcKs/tm3z+5JfsLnZ5tsY9XCDxm35vHYDe20yEn8DDc2l2W5EfcAemyxwRMoMwcqjIQwXpumuh2S9nfYDncBp4CjlefSjRG8I/rlpgErxO229Dl5XabpAeas+T3n/6AS6gARUkDwEvBKCJ/J5bQdeagRiVoApkNY1UNxgqxdYDW4FkBizOSHxKbA3BJ+vzsvnM9shrQtRF+BKGLUAHe3tTA4MMFHvBhyjdtjkgB8WLWLd1q3+ZV4Ac4l6EMksef9ahOAXJXYCXcUin0+/pv3nADNBxKgVCwpQBbEb6LL5bHBQNywoQAVioAyhrlKJ7gUHmILw3SH4Q1iAVVAv/gHOsYXbWmuiCAAAAABJRU5ErkJggg=="
                    class="qwiz-zoom-control qwiz-zoom-control-zoom-out" title="Zoom out (or use mousewheel)" />
               <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAABJ0AAASdAHeZh94AAADWElEQVRYhb2XTWicVRSGn/ebSVqijT9UKEaFYAguXEhFA1Ilmyqo1YXG4g8IihgUqUoXlVhujlJCQRexm1IXgguDFRRcFZGYjfGnICIIJYtarcQiEoLSGJ1kXhf5xkySmcxkmvRs7rlzzz3Py/3unO98Gh42rVpE93b45WUof5ySp1rJkbVMB7Ls3O12ecTmdIQeu+wCyuViIXc7bX0YoXci1L6RHMWNQiOUAb1Q6LUX+5ZXjM1LEnceOaL9Q0P+uZl8avYORLTdZS88BzwI7GwQ/qvU353SFwuN8jY8gQjdYjMK3NuU0iX7uhk4NLgDEcVngO+W4ZqTGJMKz0ptfRKPr9qyIGVDEvubVVr3BCL0us2bOfhf8FuS307JM1Ux2yu+xG9QfCKl0kSz8LoCIgqDy3DOSn4kJX9fI3Q2H8eBJ1MqXdgIHGo8goj23XZ5NJ9OSR1314GTkn+QuFlib0reMBxWnUBEZFA6DrQDf0rsS+ni9HoJUvLZVsAVW3EC0vDDNncs+bzWanltWYDNi7l7Fjix1fAVAiK0E+gHkHg3JTf1P940AVC4x6ZS2z+9HPBVAnwrgMRfwJmtgEWoGKEVF79KQHkXgM35lFzeAninzU/AVIQ6agigHUDin82G53YbcINNN9C7RoDNxXzcsUUCrq44hQJ/rxEgZedz96Zjx7RtCwT05GN5cZEKq/oRZJVy2z4zs1SMNtn25ONUSp6rIWBhElRZaKm/q2dHj+oqm/vy6efVa/8LSMlzkj8BsPV0hK7dLAHz89nzQAeAxFhNAQBZxigIcGfV6/iSLEK7oHwoh3+TkifrCjh82KfBJ/PpYIQeukR4EXjf5hoJA4dWx6zpByQOAL/nax9EqL9VuJ29Z7M3/+l4Sp5oKCAlX5AYAOZtrgBOReiFpV6hafj1wCkoPwUg8SXwaq3Yum15hO63+Yjly/MV8AbwWb1SPTKi60olBstlHQR35ohJyQ+k5Nlae9b9LojQbpsxqkonMA2MS/wI/CGxzebGvJHZQ17S88t8QuJASp6vx2j4YRLR1QHTB21eoaqcNrBv845qvFHgBr6MdCXwqM0+iT5bXbC0N3+BnQEmoHgypdLkOqlaE7BWUFdHW9v0DomFnh5mBwa82Eqe/wD+zkBjSHjv0QAAAABJRU5ErkJggg=="
                    class="qwiz-zoom-control qwiz-zoom-control-reset" onclick="q_periodic_table_.zoom_reset ()" title="Reset zoom and pan" />
            </div>

            <div class="qwiz-zoom-container unselectable" style="overflow: auto;">
               <div class="qwiz-zoom-container-inner">
                  <div class="qwiz-zoom-container-inner-content">
                     <div id="q_periodic_table" class="q_periodic_table">
                     </div>
                     <div id="q_periodic_table_large" class="q_periodic_table" style="display: none;">
                     </div>
                  </div>
               </div>
            </div>
         </div>
      `;

      return htm;
   }


   // ---------------------------------------------------------------------------
   this.q_periodic_table_dialog_exit = function () {
      $q_periodic_table_dialog.hide ();
   }


   // ---------------------------------------------------------------------------
   var no_select_item_mouseleave = false;
   function select_item_click (event) {
      if (debug) {
         console.log ('[select_item_click] event:', event);
      }
      const element_id = event.currentTarget.innerText.replace (/\s/g, '');
      if (debug) {
         console.log ('[select_item_click] element_id:', element_id);
      }
      q_periodic_table_zoomarea.settings.dragged = false;
      no_select_item_mouseleave                  = true;
      q_hover_select_.no_scroll_item_mousemove   = true;
      q.zoom_to ('', element_id);
   }


   // ---------------------------------------------------------------------------
   function select_item_mouseenter (event) {
      if (debug) {
         console.log ('[select_item_mouseenter] event:', event);
      }
      const element_id = event.currentTarget.innerText.replace (/\s/g, '');
      if (debug) {
         console.log ('[select_item_mouseenter] element_id:', element_id);
      }
      $current_table.find (`td.element_id-${element_id}`).css ({outline: '2px solid red'});
   }


   // ---------------------------------------------------------------------------
   function select_item_mouseleave (event) {
      if (no_select_item_mouseleave) {
         no_select_item_mouseleave = false;
         return;
      }
      const element_id = event.currentTarget.innerText.replace (/\s/g, '');
      if (debug) {
         console.log ('[select_item_mouseleave] event:', event);
         console.log ('[select_item_mouseleave] element_id:', element_id);
      }
      $current_table.find (`td.element_id-${element_id}`).css ({outline: ''});
   }


   // ---------------------------------------------------------------------------
   function q_periodic_table_drag () {
      //unhighlight_current ();
   }


   // ---------------------------------------------------------------------------
   // Switch between spare table and detailed ("large") table depending on zoom
   // level.
   function q_periodic_table_zoom () {

      // If first zoom (ZoomArea init), do nothing.
      if (! q_periodic_table_zoomarea) {
         return;
      }
      const initialZoomLevel = q_periodic_table_zoomarea.settings.initialZoomLevel;
      if (q_periodic_table_zoomarea.settings.zoomLevel > initialZoomLevel*1.1) {
         $ ('.qwiz-zoom-container-inner-content').css ({cursor: 'move'});
      } else {
         $ ('.qwiz-zoom-container-inner-content').css ({cursor: ''});
      }

      if (q_periodic_table_zoomarea.settings.zoomLevel > initialZoomLevel*1.3) {
         $q_periodic_table.hide ();
         $q_periodic_table_large.show ();
         $current_table = $q_periodic_table_large;
      } else {
         $q_periodic_table.show ();
         $q_periodic_table_large.hide ();
         $current_table = $q_periodic_table;
      }
   }


   // ---------------------------------------------------------------------------
   function unhighlight_current () {
      if ($current_cells) {
         $current_cells.css ({outline: ''});
      }

      return '';
   }


   // ---------------------------------------------------------------------------
   this.zoom_to = function (event, element_id) {
      const settings = q_periodic_table_zoomarea.settings;
      if (debug) {
         console.log ('[zoom_to] event:', event, ', element_id:', element_id);
         console.log ('[zoom_to] settings.dragged:', settings.dragged);
      }

      // Do only on click (not "dragged").
      if (! settings.dragged) {

         // Un-highlight any previous;
         if ($current_cells) {
            $current_cells.css ({outline: ''});
         }

         var current_cell_el;
         if (event) {
            current_cell_el = event.currentTarget;

            // Get cell element ID.
            const classnames = event.currentTarget.className;
            const m = classnames.match (/element_id-(\S+)/);
            $current_cells = '';
            if (m) {
               element_id = m[1];
            }
         } else {
            current_cell_el = $current_table.find (`td.element_id-${element_id}`)[0];
         }

         // Match cells in both simple and detailed tables.
         $current_cells = $ ('div.q_periodic_table td.element_id-' + element_id);

         // Point to zoom to: center of target element box (position within
         // current zoom div.
         const $parent_div = $ (current_cell_el).parents ('div.qwiz-zoom-container-inner-content');
         if (debug) {
            console.log ('[zoom_to] $parent_div:', $parent_div);
         }

         const cell_rect   = current_cell_el.getBoundingClientRect ();
         const parent_rect = $parent_div[0].getBoundingClientRect ();
         if (debug) {
            console.log ('[zoom_to] cell_rect:', cell_rect);
            console.log ('[zoom_to] parent_rect:', parent_rect);
         }

         const pctX = (cell_rect.left - parent_rect.left + cell_rect.width/2 )/parent_rect.width  * 100;
         const pctY = (cell_rect.top  - parent_rect.top  + cell_rect.height/2)/parent_rect.height * 100;
         if (debug) {
            console.log ('[zoom_to] pctX:', pctX, ', pctY:', pctY);
         }

         // Zoom in, center on current click.
         const zoomLevel = q_periodic_table_zoomarea.settings.initialZoomLevel * 2.8;
         q_periodic_table_zoomarea.zoomToPoint (zoomLevel, pctX, pctY);

         // Highlight cell.
         if ($current_cells) {
            $current_cells.css ({outline: '2px solid red'});
         }
      }
   }


   // ---------------------------------------------------------------------------
   this.zoom_reset = function () {
      q_periodic_table_zoomarea.zoomToFit ();
      fit_zoomLevel = q_periodic_table_zoomarea.settings.zoomLevel;
   }


   // ---------------------------------------------------------------------------
   // Periodic table.
   this.element_symbols = [
      '',
      'H',                                                                                                  'He',
      'Li', 'Be',                                                             'B',  'C',  'N',  'O',  'F',  'Ne',
      'Na', 'Mg',                                                             'Al', 'Si', 'P',  'S',  'Cl', 'Ar',
      'K',  'Ca', 'Sc', 'Ti', 'V',  'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr',
      'Rb', 'Sr', 'Y',  'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I',  'Xe',

      // Period 6.
      'Cs', 'Ba',

      // Lanthanides.
      'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu',

      // Period 6 (cont'd).
                        'Hf', 'Ta', 'W',  'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn',

      // Period 7.
      'Fr', 'Ra',

      // Actinides.
      'Ac', 'Th', 'Pa', 'U',  'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm', 'Md', 'No', 'Lr',

      // Period 7 (cont'd).
                        'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds', 'Rg', 'Cn', 'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og'
   ];

   const chemgroupblock_colors = {
      'Nonmetal'                 : '#159ef9',
      'Noble gas'                : '#a58dfc',
      'Alkali metal'             : '#f9311f',
      'Alkaline earth metal'     : '#f9a806',
      'Transition metal'         : '#83cc05',
      'Metalloid'                : '#05c8d6',
      'Post-transition metal'    : '#05c27d',
      'Nonmetal'                 : '#159ef9',
      'Lanthanoid'               : '#06f489',
      'Actinoid'                 : '#05d6c4',
      'unknown'                  : '#cccccc'
   }


   this.element_data = {
      ''  : [''             , '',                      ''],
      'H' : ['Hydrogen'     , 'Nonmetal',              1.0080],
      'He': ['Helium'       , 'Noble gas',             4.0026],
      'Li': ['Lithium'      , 'Alkali metal',          6.94],
      'Be': ['Beryllium'    , 'Alkaline earth metal',  9.0122],
      'B' : ['Boron'        , 'Metalloid',             10.81],
      'C' : ['Carbon'       , 'Nonmetal',              12.011],
      'N' : ['Nitrogen'     , 'Nonmetal',              14.007],
      'O' : ['Oxygen'       , 'Nonmetal',              15.999],
      'F' : ['Fluorine'     , 'Nonmetal',              18.998],
      'Ne': ['Neon'         , 'Noble gas',             20.180],
      'Na': ['Sodium'       , 'Alkali metal',          22.990],
      'Mg': ['Magnesium'    , 'Alkaline earth metal',  24.305],
      'Al': ['Aluminum'     , 'Post-transition metal', 26.982],
      'Si': ['Silicon'      , 'Metalloid',             28.085],
      'P' : ['Phosphorus'   , 'Nonmetal',              30.974],
      'S' : ['Sulfur'       , 'Nonmetal',              32.06],
      'Cl': ['Chlorine'     , 'Nonmetal',              35.45],
      'Ar': ['Argon'        , 'Noble gas',             39.95],
      'K' : ['Potassium'    , 'Alkali metal',          39.098],
      'Ca': ['Calcium'      , 'Alkaline earth metal',  40.078],
      'Sc': ['Scandium'     , 'Transition metal',      44.956],
      'Ti': ['Titanium'     , 'Transition metal',      47.867],
      'V' : ['Vanadium'     , 'Transition metal',      50.942],
      'Cr': ['Chromium'     , 'Transition metal',      51.996],
      'Mn': ['Manganese'    , 'Transition metal',      54.938],
      'Fe': ['Iron'         , 'Transition metal',      55.845],
      'Co': ['Cobalt'       , 'Transition metal',      58.933],
      'Ni': ['Nickel'       , 'Transition metal',      58.693],
      'Cu': ['Copper'       , 'Transition metal',      63.546],
      'Zn': ['Zinc'         , 'Transition metal',      65.38],
      'Ga': ['Gallium'      , 'Post-transition metal', 69.723],
      'Ge': ['Germanium'    , 'Metalloid',             72.630],
      'As': ['Arsenic'      , 'Metalloid',             74.922],
      'Se': ['Selenium'     , 'Nonmetal',              78.971],
      'Br': ['Bromine'      , 'Nonmetal',              79.904],
      'Kr': ['Krypton'      , 'Noble gas',             83.798],
      'Rb': ['Rubidium'     , 'Alkali metal',          85.468],
      'Sr': ['Strontium'    , 'Alkaline earth metal',  87.62],
      'Y' : ['Yttrium'      , 'Transition metal',      88.906],
      'Zr': ['Zirconium'    , 'Transition metal',      91.224],
      'Nb': ['Niobium'      , 'Transition metal',      92.906],
      'Mo': ['Molybdenum'   , 'Transition metal',      95.95],
      'Tc': ['Technetium'   , 'Transition metal',      '(98)'],
      'Ru': ['Ruthenium'    , 'Transition metal',      101.07],
      'Rh': ['Rhodium'      , 'Transition metal',      102.91],
      'Pd': ['Palladium'    , 'Transition metal',      106.42],
      'Ag': ['Silver'       , 'Transition metal',      107.87],
      'Cd': ['Cadmium'      , 'Transition metal',      112.41],
      'In': ['Indium'       , 'Post-transition metal', 114.82],
      'Sn': ['Tin'          , 'Post-transition metal', 118.71],
      'Sb': ['Antimony'     , 'Metalloid',             121.76],
      'Te': ['Tellurium'    , 'Metalloid',             127.60],
      'I' : ['Iodine'       , 'Nonmetal',              126.90],
      'Xe': ['Xenon'        , 'Noble gas',             131.29],
      'Cs': ['Cesium'       , 'Alkali metal',          132.91],
      'Ba': ['Barium'       , 'Alkaline earth metal',  137.33],
      'La': ['Lanthanum'    , 'Lanthanoid',            138.91],
      'Ce': ['Cerium'       , 'Lanthanoid',            140.12],
      'Pr': ['Praeseodymium', 'Lanthanoid',            140.91],
      'Nd': ['Neodymium'    , 'Lanthanoid',            144.24],
      'Pm': ['Promethium'   , 'Lanthanoid',            '(145)'],
      'Sm': ['Samarium'     , 'Lanthanoid',            150.36],
      'Eu': ['Europium'     , 'Lanthanoid',            151.96],
      'Gd': ['Gadolinium'   , 'Lanthanoid',            157.25],
      'Tb': ['Terbium'      , 'Lanthanoid',            158.93],
      'Dy': ['Dysprosium'   , 'Lanthanoid',            162.50],
      'Ho': ['Holmium'      , 'Lanthanoid',            164.93],
      'Er': ['Erbium'       , 'Lanthanoid',            167.26],
      'Tm': ['Thulium'      , 'Lanthanoid',            168.93],
      'Yb': ['Ytterbium'    , 'Lanthanoid',            173.05],
      'Lu': ['Lutetium'     , 'Lanthanoid',            174.97],
      'Hf': ['Hafnium'      , 'Transition metal',      178.49],
      'Ta': ['Tantalum'     , 'Transition metal',      180.95],
      'W' : ['Tungsten'     , 'Transition metal',      183.84],
      'Re': ['Rhenium'      , 'Transition metal',      186.21],
      'Os': ['Osmium'       , 'Transition metal',      190.23],
      'Ir': ['Iridium'      , 'Transition metal',      192.22],
      'Pt': ['Platinum'     , 'Transition metal',      195.08],
      'Au': ['Gold'         , 'Transition metal',      196.97],
      'Hg': ['Mercury'      , 'Transition metal',      200.59],
      'Tl': ['Thallium'     , 'Post-transition metal', 204.38],
      'Pb': ['Lead'         , 'Post-transition metal', 207.2],
      'Bi': ['Bismuth'      , 'Post-transition metal', 208.98],
      'Po': ['Polonium'     , 'Post-transition metal', '(209)'],
      'At': ['Astatine'     , 'Metalloid',             '(210)'],
      'Rn': ['Radon'        , 'Noble gas',             '(222)'],
      'Fr': ['Francium'     , 'Alkali metal',          '(223)'],
      'Ra': ['Radium'       , 'Alkaline earth metal',  '(226)'],
      'Ac': ['Actinium'     , 'Actinoid',              '(227)'],
      'Th': ['Thorium'      , 'Actinoid',              232.04],
      'Pa': ['Protactinium' , 'Actinoid',              231.04],
      'U' : ['Uranium'      , 'Actinoid',              238.03],
      'Np': ['Neptunium'    , 'Actinoid',              '(237)'],
      'Pu': ['Plutonium'    , 'Actinoid',              '(244)'],
      'Am': ['Americium'    , 'Actinoid',              '(243)'],
      'Cm': ['Curium'       , 'Actinoid',              '(247)'],
      'Bk': ['Berkelium'    , 'Actinoid',              '(247)'],
      'Cf': ['Californium'  , 'Actinoid',              '(251)'],
      'Es': ['Einsteinium'  , 'Actinoid',              '(252)'],
      'Fm': ['Fermium'      , 'Actinoid',              '(257)'],
      'Md': ['Mendelevium'  , 'Actinoid',              '(258)'],
      'No': ['Nobelium'     , 'Actinoid',              '(259)'],
      'Lr': ['Lawrencium'   , 'Actinoid',              '(266)'],
      'Rf': ['Rutherfordium', 'Transition metal',      '(261)'],
      'Db': ['Dubnium'      , 'Transition metal',      '(262)'],
      'Sg': ['Seaborgium'   , 'Transition metal',      '(266)'],
      'Bh': ['Bohrium'      , 'Transition metal',      '(264)'],
      'Hs': ['Hassium'      , 'Transition metal',      '(277)'],
      'Mt': ['Meitnerium'   , 'unknown',               '(268)'],
      'Ds': ['Darmstadtium' , 'unknown',               '(281)'],
      'Rg': ['Roentgenium'  , 'unknown',               '(272)'],
      'Cn': ['Copernicium'  , 'Transition metal',      '(285)'],
      'Nh': ['Nihonium'     , 'unknown',               '(286)'],
      'Fl': ['Flerovium'    , 'Post-transition metal', '(289)'],
      'Mc': ['Moscovium'    , 'unknown',               '(290)'],
      'Lv': ['Livermorium'  , 'unknown',               '(292)'],
      'Ts': ['Tennessine'   , 'unknown',               '(294)'],
      'Og': ['Oganesson'    , 'unknown',               '(294)'],
   };

   function group_head (group_num, synonym, large) {
      var htm = `<td class="group_num ${large}">\n`;
      if (large) {
         htm += `   <a href="javascript:group (${group_num})">
                       ${synonym}
                       <br />
                       (${group_num})
                    </a>\n`;
      }
      htm +=    `</td>\n`;

      return htm;
   }

   function period_label (period_num, large, default_period_num='') {
      var htm = `<td class="period_num ${large}">\n`;
      if (large) {
         htm += `    ${period_num}\n`;
      } else if (default_period_num) {
         htm += `    ${default_period_num}\n`;
      }
      htm +=    `</td>\n`;

      return htm;
   }

   function element (atomic_num, large) {
      const symbol               = q.element_symbols[atomic_num];
      const element_name         = q.element_data[symbol][0];
      const element_atomic_mass  = q.element_data[symbol][2]
      const chemblockgroup_name  = q.element_data[symbol][1];
      const chemblockgroup_color = chemgroupblock_colors[chemblockgroup_name];
      var htm = `
         <td class="element_box element_id-${symbol} element_id-${element_name} ${large}" style="background: ${chemblockgroup_color};">
      `;
      if (large) {
         htm += `
            <div class="atomic_number ${large}">
               ${atomic_num}
            </div>
         `;
      }
      htm += `
            <div class="element_symbol ${large}">
               ${symbol}
            </div>
      `;
      if (large) {
         htm += `
            <div class="element_name ${large}">
               ${element_name}
            </div>
            <div class="element_name ${large}">
               ${element_atomic_mass}
            </div>
         </td>
         `;
      }

      return htm
   }

   function q_periodic_table (large, display) {
      if (! large) {
         large = '';
      }
      var htm = [];
      const style = display ? ' style="display: ' + display + ';"' : '';
      htm.push ('<table class="q_periodic_table"' + style + '>');

      //           Period one header.
      htm.push (   '<tr>');

      //              Period label (none for header).
      htm.push (      period_label ('', large));

      htm.push (      group_head (1, '1A', large));

      htm.push (      '<td colspan="16">');
      htm.push (      '</td>');

      htm.push (      group_head (18, '8A', large));
      htm.push (   '</tr>');

      //              Period one.
      htm.push (   '<tr>');

      //              Row number.
      htm.push (      period_label (1, large));

      htm.push (      element (1, large));

      htm.push (      group_head (2, '2A', large));

      htm.push (      '<td colspan="10">');
      htm.push (      '</td>');

      htm.push (      group_head (13, '3A', large));
      htm.push (      group_head (14, '4A', large));
      htm.push (      group_head (15, '5A', large));
      htm.push (      group_head (16, '6A', large));
      htm.push (      group_head (17, '7A', large));

      htm.push (      element (2, large));
      htm.push (   '</tr>');

      //           // Period two, row number.
      htm.push (   '<tr>');
      htm.push (      period_label (2, large));
      htm.push (      element (3, large));
      htm.push (      element (4, large));

      htm.push (      '<td colspan="10">');
      htm.push (      '</td>');

      htm.push (      element (5, large));
      htm.push (      element (6, large));
      htm.push (      element (7, large));
      htm.push (      element (8, large));
      htm.push (      element (9, large));
      htm.push (      element (10, large));
      htm.push (   '</tr>');

      //           // Period three, row number.
      htm.push (   '<tr>');
      htm.push (      period_label (3, large));
      htm.push (      element (11, large));
      htm.push (      element (12, large));

      htm.push (      group_head (3, '3B', large));
      htm.push (      group_head (4, '4B', large));
      htm.push (      group_head (5, '5B', large));
      htm.push (      group_head (6, '6B', large));
      htm.push (      group_head (7, '7B', large));
      htm.push (      group_head (8, '8B', large));
      htm.push (      group_head (9, '9B', large));
      htm.push (      group_head (10, '10B', large));
      htm.push (      group_head (11, '11B', large));
      htm.push (      group_head (12, '12B', large));

      for (let i=13; i<=18; i++) {
         htm.push (   element (i, large));
      }
      htm.push (   '</tr>');

      //           // Period four.
      htm.push (   '<tr>');
      htm.push (      period_label (4, large));
      for (let i=19; i<=36; i++) {
         htm.push (   element (i, large));
      }
      htm.push (   '</tr>');

      //           // Period five.
      htm.push (   '<tr>');
      htm.push (      period_label (5, large));
      for (let i=37; i<=54; i++) {
         htm.push (   element (i, large));
      }
      htm.push (   '</tr>');

      //           // Period six.
      htm.push (   '<tr>');
      htm.push (      period_label (6, large));

      htm.push (      element (55, large));
      htm.push (      element (56, large));

                      // Lanthanoids placeholder.
      var color = chemgroupblock_colors['Lanthanoid']
      htm.push (      '<td class="element element_symbol ' + large + ' center" style="background: ' + color + ';">');
      htm.push (         '*');
      htm.push (      '</td>');

      for (let i=72; i<=86; i++) {
         htm.push (   element (i, large));
      }
      htm.push (   '</tr>');

      //           // Period seven.
      htm.push (   '<tr>');
      htm.push (      period_label (7, large));

      htm.push (      element (87, large));
      htm.push (      element (88, large));

                      // Actinoids placeholder.
      color = chemgroupblock_colors['Actinoid']
      htm.push (      '<td class="element element_symbol ' + large + ' center" style="background: ' + color + ';">');
      htm.push (         '**');
      htm.push (      '</td>');

      for (let i=104; i<=118; i++) {
         htm.push (   element (i, large));
      }
      htm.push (   '</tr>');
      htm.push ('</table>');

      htm.push ('<br />');

      // Lanthanoides and actinoids rows.
      const td_class = large ? ' class="periodic_table_large"' : '';
      htm.push ('<table class="q_periodic_table"' + style + '>');
      htm.push (   '<tr>');
      htm.push (      '<td' + td_class + '>');
      htm.push (      '</td>');
      htm.push (      period_label ('*&nbsp;Lanthanoids', large, '*'));
      for (let i=57; i<=71; i++) {
         htm.push (   element (i, large));
      }
      htm.push (   '</tr>');

      htm.push (   '<tr>');
      htm.push (      '<td' + td_class + '>');
      htm.push (      '</td>');
      htm.push (      period_label ('**&nbsp;Actinoids', large, '**'));
      for (let i=89; i<=103; i++) {
         htm.push (   element (i, large));
      }
      htm.push (   '</tr>');
      htm.push ('</table>');

      return htm.join ('\n');
   }


   // Close - isolate namespace.
};
q_periodic_tablef.call (q_periodic_table_);


// =============================================================================
// Isolate namespace.
q_hover_select_ = {};
var q_hover_selectf = function () {
   var $ = jQuery;

   // Private globals.
   const debug = false;
   const q = this;
   const dropdown_height = 300;

   // Create hover-select dropdown on page element.
   this.init = function (div_id, list_items, offset_left=5, offset_top=20,
                         item_click='', item_mouseenter='', item_mouseleave='') {

      // Don't sort original array (shallow copy instead of in-place).
      list_items = [...list_items].sort ();

      var htm = [];

      // Save argument setting as data in case switch to/from mobile.
      var   style;
      const data_offset_left = `data-offset_left="${offset_left}"`;
      if (is_mobile ()) {
         style = `left: 0; top: ${offset_top}px;`;
      } else {
         style = `left: ${offset_left}px; top: ${offset_top}px;`;
      }

      htm.push (`<div class="hover-select-dropdown" style="${style}" ${data_offset_left} onmousemove="q_hover_select_.scroll_hover_select (this)">`);
      htm.push (   '<div class="hover-select-dropdown-content">');
      for (const list_item of list_items) {
         htm.push (   `<div class="hover-select-list-item">`);
         htm.push (      list_item);
         htm.push (   '</div>');
      }
      htm.push (   '</div>');
      htm.push ('</div>');

      const $div = $ ('#' + div_id);
      $div.append (htm.join ('\n')).css ({position: 'relative'});

      // Bind events to dropdown div; pass element as data.
      const hover_select_dropdown_el = $div.find ('div.hover-select-dropdown')[0];
      $ (hover_select_dropdown_el).css ({height: dropdown_height + 'px'});
      const data = {hover_select_dropdown_el: hover_select_dropdown_el};
      $div.on ('click',      data, hover_select_click)
          .on ('mouseenter', data, hover_select_mouseenter)
          .on ('mouseleave', data, hover_select_mouseleave);

      // Bind events to each list item.
      if (item_click) {
         $div.find ('div.hover-select-list-item').on ('click', item_click);
      }
      if (item_mouseenter) {
         $div.find ('div.hover-select-list-item').on ('mouseenter', item_mouseenter);
      }
      if (item_mouseleave) {
         $div.find ('div.hover-select-list-item').on ('mouseleave', item_mouseleave);
      }
   }


   // If dropdown visible, hide; otherwise show.
   function hover_select_click (event) {
      const hover_select_dropdown_el = event.data['hover_select_dropdown_el'];
      const $hover_select_dropdown   = $ (hover_select_dropdown_el);
      if (debug) {
         console.log ('[hover_select_click] $hover_select_dropdown.is (":visible"):', $hover_select_dropdown.is (":visible"))
      }
      if ($hover_select_dropdown.is (':visible')) {
         $hover_select_dropdown.hide ();
      } else {
         var offset_left;
         if (is_mobile ()) {
            offset_left = 0;
         } else {
            offset_left = $hover_select_dropdown.data ('offset_left');
         }
         $hover_select_dropdown.css ({display: 'inline-block', left: `${offset_left}px`});
      }
   }


   // Show dropdown, clear any timeout for previous mouseleave/hide (left briefly
   // and re-entered).
   function hover_select_mouseenter (event) {
      if (debug) {
         console.log ('[hover_select_mouseenter] event:', event);
      }
      const hover_select_dropdown_el = event.data['hover_select_dropdown_el'];
      const $hover_select_dropdown   = $ (hover_select_dropdown_el);

      // Slight delay so mobile click can get there first!
      const delay_show = function () {
         var offset_left;
         if (is_mobile ()) {
            offset_left = 0;
         } else {
            offset_left = $hover_select_dropdown.data ('offset_left');
         }
         $hover_select_dropdown.css ({display: 'inline-block', left: `${offset_left}px`});
      }
      setTimeout (delay_show, 20);

      if (hover_select_dropdown_el.hover_select_hide_timeout) {
         if (debug) {
            console.log ('[hover_select_mouseenter] hover_select_dropdown_el.hover_select_hide_timeout:', hover_select_dropdown_el.hover_select_hide_timeout);
         }
         clearTimeout (hover_select_dropdown_el.hover_select_hide_timeout);
         hover_select_dropdown_el.hover_select_hide_timeout = '';
      }
   }


   // Set to hide dropdown if leave container ("find by...") or dropdown itself
   // (which counts as part of container).  Separately, mouseenter will cancel
   // existing hide timeout if any.
   function hover_select_mouseleave (event) {
      const hover_select_dropdown_el = event.data['hover_select_dropdown_el'];

      const delay_hide_dropdown = function () {
         if (debug) {
            console.log ('[delay_hide_dropdown] event:', event);
         }
         $( hover_select_dropdown_el).hide ();
      }
      hover_select_dropdown_el.hover_select_hide_timeout = setTimeout (delay_hide_dropdown, 750);
   }


   // Response to mousemove on hover-select dropdown.  Delay a bit in case
   // responding to dropdown-item click (since on touch device only the click
   // triggers a "mousemove").
   this.no_scroll_item_mousemove = false;
   var prev_viewport_mouse_y = -100;
   var prev_scrollY;
   this.scroll_hover_select = function (dropdown_el) {
      const e = event;
      const delay_scroll = function () {
         if (debug) {
            console.log ('[scroll_hover_select] event:', event);
         }
         if (q.no_scroll_item_mousemove) {
            q.no_scroll_item_mousemove = false;
            return;
         }

         var $dropdown = dropdown_el.hover_select_$dropdown;
         var content_width;
         var content_height;
         var content_dropdown_height_ratio;
         if ($dropdown) {
            content_width  = dropdown_el.hover_select_content_width;
            content_height = dropdown_el.hover_select_content_height;
            content_dropdown_height_ratio = dropdown_el.hover_select_content_dropdown_height_ratio;
         } else {
            var   $dropdown  = $ (dropdown_el);
            const content_el = $dropdown.find ('div.hover-select-dropdown-content')[0]
            content_width    = content_el.offsetWidth;
            content_height   = content_el.offsetHeight;
            content_dropdown_height_ratio = content_height / dropdown_height;

            dropdown_el.hover_select_$dropdown      = $dropdown;
            dropdown_el.hover_select_content_width  = content_width;
            dropdown_el.hover_select_content_height = content_height;
            dropdown_el.hover_select_content_dropdown_height_ratio = content_dropdown_height_ratio;
            if (debug) {
               console.log ('[scroll_hover_select] content_width:', content_width, ', content_height:', content_height);
            }
         }
         const rect = dropdown_el.getBoundingClientRect ();
         dropdown_viewport_left = rect.left;
         const viewport_mouse_x = e.clientX;
         const dropdown_mouse_x = viewport_mouse_x - dropdown_viewport_left;

         // Do only if not near right side of dropdown (that is, not over
         // vertical scrollbar).  Content width plus padding.
         if (dropdown_mouse_x < content_width + 6) {
            dropdown_viewport_top  = rect.top;
            const viewport_mouse_y = e.clientY;

            console.log ('[scroll_hover_select] prev_viewport_mouse_y:', prev_viewport_mouse_y, ', viewport_mouse_y:', viewport_mouse_y);
            const dropdown_mouse_y = viewport_mouse_y - dropdown_viewport_top;
            console.log ('[scroll_hover_select] dropdown_mouse_y:', dropdown_mouse_y);

            if (dropdown_mouse_y < 16) {

               // Scroll towards top.
               $dropdown.stop (true).animate ({scrollTop: 0}, 1500);
               prev_scrollY = 0;
            } else if (dropdown_mouse_y > dropdown_height - 26) {

               // Scroll towards bottom.
               $dropdown.stop (true).animate ({scrollTop: content_height}, 1500);
               prev_scrollY = content_height;
            } else {
               scrollY = (dropdown_mouse_y - 10)*(content_dropdown_height_ratio + 1);
               const delta_y = viewport_mouse_y - prev_viewport_mouse_y;

               // If the mousemove (since last event) is small-ish, make the
               // scroll small, too.
               if (Math.abs (delta_y) < 6) {
                  scrollY = prev_scrollY + delta_y;
               }
               //dropdown_el.scrollTop = scrollY;
               $dropdown.stop (true).animate ({scrollTop: scrollY}, 200);
               prev_viewport_mouse_y = viewport_mouse_y;
               prev_scrollY          = scrollY;
            }
         }
      }
      setTimeout (delay_scroll, 10);
   }


   function is_mobile () {
      mobile_b = window.innerWidth < 961 || window.innerHeight < 450;

      return mobile_b;
   }



   // Close - isolate namespace.
};
q_hover_selectf.call (q_hover_select_);
// =============================================================================

