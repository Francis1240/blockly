/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Methods for graphically rendering a block as SVG.
 * @author fenichel@google.com (Rachel Fenichel)
 */

//'use strict';
goog.provide('Blockly.BlockRendering.Debug');
goog.require('Blockly.BlockRendering.RenderInfo');
goog.require('Blockly.BlockRendering.Highlighter');
goog.require('BRC');
goog.require('Blockly.BlockRendering.Measurable');

/**
 * An object that renders rectangles and dots for debugging rendering code.
 * @package
 */
Blockly.BlockRendering.Debug = function() {
  /**
   * An array of SVG elements that have been created by this object.
   * @type {Array.<!SVGElement>}
   */
  this.debugElements_ = [];

  /**
   * The SVG root of the block that is being rendered.  Debug elements will
   * be attached to this root.
   * @type {!SVGElement}
   */
  this.svgRoot_ = null;
};

/**
 * Remove all elements the this object created on the last pass.
 * @package
 */
Blockly.BlockRendering.Debug.prototype.clearElems = function() {
  for (var i = 0, elem; elem = this.debugElements_[i]; i++) {
    Blockly.utils.removeNode(elem);
  }

  this.debugElements_ = [];
};

/**
 * Draw a debug rectangle for a spacer (empty) row.
 * @param {!Blockly.BlockRendering.Row} row The row to render
 * @param {number} cursorY The y position of the top of the row.
 * @package
 */
Blockly.BlockRendering.Debug.prototype.drawSpacerRow = function(row, cursorY) {
  this.debugElements_.push(Blockly.utils.createSvgElement('rect',
      {
        'class': 'rowSpacerRect blockRenderDebug',
        'x': 0,
        'y': cursorY,
        'width': row.width,
        'height': row.height,
      },
      this.svgRoot_));
};

/**
 * Draw a debug rectangle for a horizontal spacer.
 * @param {!Blockly.BlockSvg.InRowSpacer} elem The spacer to render
 * @param {number} cursorX The x position of the left of the row.
 * @param {number} centerY The y position of the center of the row, vertically.
 * @package
 */
Blockly.BlockRendering.Debug.prototype.drawSpacerElem = function(elem, cursorX, centerY) {
  var yPos = centerY - elem.height / 2;
  // this.debugElements_.push(Blockly.utils.createSvgElement('rect',
  //     {
  //       'class': 'elemSpacerRect blockRenderDebug',
  //       'x': cursorX,
  //       'y': yPos,
  //       'width': elem.width,
  //       'height': 15,
  //     },
  //     this.svgRoot_));
};

/**
 * Draw a debug rectangle for an in-row element.
 * @param {!Blockly.BlockSvg.Measurable} elem The element to render
 * @param {number} cursorX The x position of the left of the row.
 * @param {number} centerY The y position of the center of the row, vertically.
 * @param {number} rowNum The index of the row.
 * @param {number} order The index of the element.
 * @package
 */
Blockly.BlockRendering.Debug.prototype.drawRenderedElem = function(elem, cursorX, centerY, rowNum, order) {
  var yPos = centerY - elem.height / 2;
  if(elem instanceof Blockly.BlockRendering.Field && elem.field instanceof Blockly.FieldLabel){
    this.debugElements_.push(Blockly.utils.createSvgElement('rect',
       {
         'class': 'elemRenderingRect blockRenderDebug',
         'x': cursorX,
         'y': yPos,
         'rx':3,
         'ry':3,
         'width': elem.width,
         'height': elem.height,
         'aria-label': elem.field.text_ + '. ',
         'data-navigation-order': 1000*rowNum+order+1,
         'onclick': "alert('Hey')"
       },
       this.svgRoot_));
  }
  else if (elem.isInput) {
    var desc = '';
    switch(elem.connection.type){
      case 1: desc = 'value connection. '
      break;
      case 3: desc = 'statement connection.'
      break;
      default: console.log('Error: wrong connection type');
    }
    console.log(elem)
    if (elem.connection.targetConnection && elem.connection.targetConnection.sourceBlock_ && elem.connection.targetConnection.sourceBlock_.type == "math_number"){
      elem.connection.targetConnection.sourceBlock_.svgGroup_.setAttribute("aria-label", elem.connection.targetConnection.sourceBlock_.inputList[0].fieldRow[0].value_)
    }
    this.debugElements_.push(Blockly.utils.createSvgElement('rect',
       {
         'class': 'connectionRect blockRenderDebug',
         'x': cursorX,
         'y': yPos,
         'rx':3,
         'ry':3,
         'width': elem.width,
         'height': elem.height,
         'aria-label': 'End of ' + desc,
         'data-navigation-order': 1000*rowNum+order+0.5,
         'onclick': "alert('Hey')"
       },
       this.svgRoot_));
       this.debugElements_.push(Blockly.utils.createSvgElement('rect',
          {
            'class': 'connectionRect blockRenderDebug',
            'x': cursorX,
            'y': yPos,
            'rx':3,
            'ry':3,
            'width': elem.width,
            'height': elem.height,
            'aria-label': 'Start of ' + desc,
            'data-navigation-order': 1000*rowNum+order-0.5,
            'onclick': "alert('Hey')"
          },
          this.svgRoot_));
//    this.drawConnection(elem.connection);
  }
};

/**
 * Draw a circle at the location of the given connection.  Inputs and outputs
 * share the same colors, as do previous and next.  When positioned correctly
 * a connected pair will look like a bullseye.
 * @param {Blockly.RenderedConnection} conn The connection to circle.
 * @package
 */
Blockly.BlockRendering.Debug.prototype.drawConnection = function(conn) {
  var colour;
  var size;
  var fill;
  if (conn.type == Blockly.INPUT_VALUE) {
    size = 4;
    colour = 'magenta';
    fill = 'none';
  } else if (conn.type == Blockly.OUTPUT_VALUE) {
    size = 2;
    colour = 'magenta';
    fill = colour;
  } else if (conn.type == Blockly.NEXT_STATEMENT) {
    size = 4;
    colour = 'goldenrod';
    fill = 'none';
  } else if (conn.type == Blockly.PREVIOUS_STATEMENT) {
    size = 2;
    colour = 'goldenrod';
    fill = colour;
  }
  this.debugElements_.push(Blockly.utils.createSvgElement('circle',
      {
        'class': 'blockRenderDebug',
        'cx': conn.offsetInBlock_.x,
        'cy': conn.offsetInBlock_.y,
        'r': size,
        'fill': fill,
        'stroke': colour,
      },
      this.svgRoot_));
};

/**
 * Draw a debug rectangle for a non-empty row,
 * while adding an aria-label to the row containing a description of all
 * subelements/fields of the row.
 * @param {!Blockly.BlockSvg.Row} row The non-empty row to render.
 * @param {number} cursorY The y position of the top of the row.
 * @param {number}
 * @package
 */
Blockly.BlockRendering.Debug.prototype.drawRenderedRow = function(row, cursorY, rowNum) {
  this.debugElements_.push(Blockly.utils.createSvgElement('rect',
      {
        'class': 'elemRenderingRect blockRenderDebug',
        'x': 0,
        'y': cursorY ,
        'width': row.width,
        'height': row.height,
//        'aria-label': this.grabDesc(row),
        'data-navigation-order': 1000*rowNum,
      },
      this.svgRoot_));
};

/**
 * Draw debug rectangles for a non-empty row and all of its subcomponents.
 * @param {!Blockly.BlockSvg.Row} row The non-empty row to render.
 * @param {number} cursorY The y position of the top of the row.
 * @param {number} rowNum The y-index of the row to render.
 * @package
 */
Blockly.BlockRendering.Debug.prototype.drawRowWithElements = function(row, cursorY, rowNum) {
  var centerY = cursorY + row.height / 2;
  var cursorX = 0;
  for (var e = 0; e < row.elements.length; e++) {
    var elem = row.elements[e];
    if (elem.isSpacer()) {
      this.drawSpacerElem(elem, cursorX, centerY);
    } else {
      this.drawRenderedElem(elem, cursorX, centerY, rowNum, e);
    }
    cursorX += elem.width;
  }
  this.drawRenderedRow(row, cursorY, rowNum);
};

/**
 * Do all of the work to draw debug information for the whole block.
 * @param {!Blockly.BlockSvg} block The block to draw debug information for.
 * @param {!Blockly.BlockRendering.RenderInfo} info Rendering information about
 *     the block to debug.
 * @package
 */
Blockly.BlockRendering.Debug.prototype.drawDebug = function(block, info) {
  this.clearElems();
  this.svgRoot_ = block.getSvgRoot();
  var cursorY = 0;
  for (var r = 0; r < info.rows.length; r++) {
    var row = info.rows[r];
    if (r == 0 && (block.type == "math_arithmetic" || block.type == "logic_operation")){
      this.drawLeftParenthesis(row, cursorY);
    }
    else if (row.hasNextConnection){
      this.drawBottomRow(row, cursorY, this.getNestingBlockName(block));
    }
    else if (r == info.rows.length-1 ){
      if (block.type == "math_arithmetic" || block.type == "logic_operation") {
        this.drawRightParenthesis(row, cursorY);
      }
      else{
        this.drawSpacerRow(row, cursorY);
      }
    }
    else if (row.isSpacer()) {
      this.drawSpacerRow(row, cursorY);
    }
    else {
      for (var c = 0; c < row.elements.length; c++) {
        var rowChild = row.elements[c];
        if (rowChild.connection) {
          if (rowChild.connection.targetConnection){
          rowChild.connection.targetConnection.sourceBlock_.svgGroup_.setAttribute("data-navigation-order", 1000*r+c);
        }
        }
        else if (rowChild.field instanceof Blockly.FieldVariable){
          rowChild.field.fieldGroup_.setAttribute("data-navigation-order", 1000*r+c);
          rowChild.field.fieldGroup_.setAttribute("aria-label", 'editable droplist. '+rowChild.field.text_ +'. ');
        }
        else if (rowChild instanceof Blockly.BlockRendering.Icon){
          rowChild.icon.iconGroup_.setAttribute("data-navigation-order", 1000*r+c);
          rowChild.icon.iconGroup_.setAttribute("aria-label", 'Modifier for ' + this.getNestingBlockName(block) + ' block.');
        }
      }
      this.drawRowWithElements(row, cursorY, r);
    }
    cursorY += row.height;
  }

  if (block.previousConnection) {
    this.drawConnection(block.previousConnection);
  }
  if (block.nextConnection) {
    this.drawConnection(block.nextConnection);
  }
  if (block.outputConnection) {
    this.drawConnection(block.outputConnection);
  }
};

/**
 * Draw a debug rectangle for the top spacer row with label 'left parenthesis. '.
 * @param {!Blockly.BlockRendering.Row} row The row to render
 * @param {number} cursorY The y position of the top of the row.
 * @package
 */
Blockly.BlockRendering.Debug.prototype.drawLeftParenthesis = function(row, cursorY) {
  this.debugElements_.push(Blockly.utils.createSvgElement('rect',
      {
        'class': 'rowSpacerRect blockRenderDebug',
        'x': 0,
        'y': cursorY,
        'width': row.width,
        'height': row.height,
        'aria-label': 'left parenthesis. ',
        'data-navigation-order': 0,
      },
      this.svgRoot_));
};

/**
 * Draw a debug rectangle for the bottom spacer row with label 'right parenthesis. '.
 * @param {!Blockly.BlockRendering.Row} row The row to render
 * @param {number} cursorY The y position of the top of the row.
 * @package
 */
Blockly.BlockRendering.Debug.prototype.drawRightParenthesis = function(row, cursorY) {
  this.debugElements_.push(Blockly.utils.createSvgElement('rect',
      {
        'class': 'rowSpacerRect blockRenderDebug',
        'x': 0,
        'y': cursorY,
        'width': row.width,
        'height': row.height,
        'aria-label': 'Right Parenthesis. ',
        'data-navigation-order': 9999999,
      },
      this.svgRoot_));
};

/**
 * Draw a debug rectangle for the bottom spacer row.
 * @param {!Blockly.BlockRendering.Row} row The row to render
 * @param {number} cursorY The y position of the top of the row.
 * @param {string} desc the name of the block
 * @package
 */
Blockly.BlockRendering.Debug.prototype.drawBottomRow = function(row, cursorY, desc) {
  this.debugElements_.push(Blockly.utils.createSvgElement('rect',
      {
        'class': 'rowSpacerRect blockRenderDebug',
        'x': 0,
        'y': cursorY,
        'width': row.width,
        'height': row.height,
        'aria-label': 'End of ' + (desc == null ? '' : desc) + ' block.',
        'data-navigation-order': 9999999,
      },
      this.svgRoot_));
};


/**
 * Construct the descriotion of a row.
 * @param {!Blockly.BlockRendering.Row} row the row to grab description fromXml
 * @package
 */
Blockly.BlockRendering.Debug.prototype.grabDesc = function(row){
  var desc = '';
  for(var i = 0; i < row.elements.length; i++){
    switch (row.elements[i].type) {
      case 'field':
        if(row.elements[i].field.textElement_ != null)
        desc += row.elements[i].field.textElement_.textContent + '. ';
        break;
      case 'icon':
        desc += '';
        break;
      case 'external value input':
        desc += row.elements[i].connectedBlock == null? 'blank. ':/*row.elements[i].connectedBlock.type + '. '*/'';
        break;
      case 'inline input':
        desc += row.elements[i].connectedBlock == null? 'blank. ':/*row.elements[i].connectedBlock.type + '. '*/'';
        break;
      case 'statement input':
        var block = row.elements[i].connection.sourceBlock_;
        desc = 'inside. ' + this.getNestingBlockName(block) + '. ' + desc;
        break;
      default:
    }
  }
  return desc;
};

Blockly.BlockRendering.Debug.prototype.getNestingBlockName = function(block) {
  var blockNames = {
    'controls_if': 'if',
    'controls_repeat_ext': 'repeat',
    'controls_forEach': 'for each',
    'controls_for': 'for',
    'procedures_defnoreturn': 'function',
    'procedures_defreturn': 'function',
    'controls_whileUntil': 'repeat while'
  }
  if ((block.type === 'controls_whileUntil'
      && block.inputList[0].fieldRow[1].getText() === 'until')) {
    blockNames['controls_whileUntil'] = 'repeat until';
  }
  if (blockNames[block.type]) {
    return blockNames[block.type];
  }
  return null;
}
