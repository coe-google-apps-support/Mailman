/**
 * @file A service focused on handling rendering text (using handlebars)
 * 
 * @author {@link https://github.com/dchenier|Dan Chenier}
 */


/**
 * This service handles Google Sheets.
 * 
 * @type {Object}
 */
var RenderService = {
    
  /**
   * The data about the current context, including row, sheetInfo, etc.
   *
   * @return {Array<any>} An array containing all of the Sheet names.
   */
  getContext: function(sheetName, headerRowIndex, dataRowIndex) {
    try {
      var spreadsheet = sheetName ? Utility.getSpreadsheet() : SpreadsheetApp.getActive();
      var sheet = sheetName ? spreadsheet.getSheetByName(sheetName) : SpreadsheetApp.getActiveSheet();

      // startRow, startColumn, numRows, numColumns
      var headerRowValues = sheet.getSheetValues(headerRowIndex && headerRowIndex === parseInt(headerRowIndex,10) ? headerRowIndex : 1, 1, 1, 128)[0];
      var rowNum = dataRowIndex;
      if (!(rowNum && rowNum === parseInt(rowNum, 10))) {
        var cell = sheet.getActiveCell();
        rowNum = cell.getRow();
      }
     
      var rowValues = sheet.getSheetValues(rowNum, 1, 1, 128)[0];

      var returnValue = {
        _meta: {
          url: spreadsheet.getUrl()
        }
      };
      var minCellLength = headerRowValues.length < rowValues.length ? headerRowValues.length : rowValues.length ;
      for (var i=0; i<minCellLength; i++) {
        var k = headerRowValues[i], v = rowValues[i];
        if (k && v && typeof k === "string") {
          returnValue[k] = v;
        }
      }
      
      return returnValue;
    }
    catch (e) {
      log(e);
      throw e;
    }
  },

  render: function(templateText, options) {
    var opt = options || {};
    var context;
    if (opt.context)
      context = opt.context;
    else {
      var sheetName = opt.sheetName, headerRowIndex = opt.headerRowIndex, dataRowIndex = opt.dataRowIndex, context = opt.context || {};
      context = RenderService.getContext(sheetName, headerRowIndex, dataRowIndex);
    }
    
    // register help methods - this should be refactored into its own method
    if (!Handlebars._coeHelpersRegistered) {
      console.log("registering coeHelpers");
      // register some helper stuff, like getData()
      registerHandlebarsHelpers(Handlebars);
    }
    
    // convert << to {{[ and >> to ]}}
    var parsedText = templateText.replace(/<<\s*(.*?)\s*>>|&lt;&lt;\s*(.*?)\s*&gt;&gt;/g, function(match, m1, m2, offset, string) {
      if (m1)
        return '{{[' + m1 + ']}}';
      else if (m2)
        return '{{[' + m2 + ']}}';
    });

    // unescape html contents between {{ and }}
    parsedText = parsedText.replace(/{{\s*(.*?)\s*}}/g, function(match, m1, m2, offset, string) {
      if (m1)
        return '{{' + m1.replace("&nbsp;", ' ').replace("%20", ' ').replace("&amp;", '&').replace("&lt;", '<').replace("&gt;", '>') + '}}';
      else if (m2)
        return '{{' + m2.replace("&nbsp;", ' ').replace("%20", ' ').replace("&amp;", '&').replace("&lt;", '<').replace("&gt;", '>') + '}}';
    });
    
    var template = Handlebars.compile(parsedText);
    return template(context);
  }
}
    