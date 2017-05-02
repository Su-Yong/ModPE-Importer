'use babel';

import AtomImporterView from './atom-importer-view';
import { CompositeDisposable } from 'atom';

let Android = {
  Button: 'android.widget.Button',
  ImageButton: 'android.widget.ImageButton',
  ToggleButton: 'android.widget.ToggleButton',
  TextView: 'android.widget.TextView',
  ImageView: 'android.widget.ImageView',
  Toast: 'android.widget.Toast',
  LinearLayout: 'android.widget.LinearLayout',
  FrameLayout: 'android.widget.FrameLayout',
  RelativeLayout: 'android.widget.RelativeLayout',
  PopupWindow: 'android.widget.PopupWindow',
  ScrollView: 'android.widget.ScrollView',
  HorizontalScrollView: 'android.widget.HorizontalScrollView',
  SeekBar: 'android.widget.SeekBar',
  EditText: 'android.widget.EditText',
  View: 'android.view.View',
  ProgressBar: 'android.widget.ProgressBar',
  Switch: 'android.widget.Switch',
  Spinner: 'android.widget.Spinner',
  ArrayAdapter: 'android.widget.ArrayAdapter',

  OnTouchListener: 'android.view.View.OnTouchListener',
  OnClickListener: 'android.view.View.OnClickListener',
  OnCheckedChangeListener: 'android.widget.CompoundButton.OnCheckedChangeListener',
  MotionEvent: 'android.view.MotionEvent',
  Gravity: 'android.view.Gravity',
  ViewGroup: 'android.view.ViewGroup',

  Dialog: 'android.app.Dialog',
  AlertDialog: 'android.app.AlertDialog',
  Intent: 'android.content.Intent',
  Uri: 'android.net.Uri',

  Bitmap: 'android.graphics.Bitmap',
  Canvas: 'android.graphics.Canvas',
  Paint: 'android.graphics.Paint',
  Drawable: 'android.graphics.drawable.Drawaable',
  BitmapDrawable: 'android.graphics.drawable.BitmapDrawable',
  ColorDrawable: 'android.graphics.drawable.ColorDrawable',
  NinePatchDrawable: 'android.graphics.drawable.NinePatchDrawable',
  Typeface: 'android.graphics.Typeface',
  Color: 'android.graphics.Color',
  RectF: 'android.graphics.RectF',
  Rect: 'android.graphics.Rect',
  BitmapFactory: 'android.graphics.BitmapFactory',

  File: 'java.io.File',
  BufferedInputStream: 'java.io.BufferedInputStream',
  FileInputStream: 'java.io.FileInputStream',
  InputStream: 'java.io.InputStream',

  TypedValue: 'android.util.TypedValue',

  Thread: 'java.lang.Thread',
  Runnable: 'java.lang.Runnable',
  URL: 'java.net.URL',
}

export default {

  atomImporterView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomImporterView = new AtomImporterView(state.atomImporterViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomImporterView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-importer:importing': () => this.importing()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomImporterView.destroy();
  },

  serialize() {
    return {
      atomImporterViewState: this.atomImporterView.serialize()
    };
  },

  importing() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText()
      for (let i in Android) {
        let node = Android[i].split('.')
        let last = node[node.length - 1]

        if (last === selection) {
          let lastPosition = editor.getCursorBufferPosition()

          let lines = [], firstLine = -1, lastLine = -1
          for (let l = 0; l < editor.getLineCount(); l++) {
            let line = editor.lineTextForScreenRow(l) + ''

            if (line.indexOf('/***Import***/') !== -1) {
              if ((firstLine > 0 && firstLine > l) || firstLine < 0) {
                firstLine = l
              }
              if(lastLine < l) {
                lastLine = l
              }

              lines.push(line)
              try {
                let name = line.split(' const ')[1].split(' = ')[0]

                if (name === selection) {
                  return
                }
              } catch (err) {}
            }
          }

          editor.moveToTop()
          editor.insertText('/***Import***/ const ' + last + ' = ' + Android[i] + '')
          editor.insertNewline()

          lines.push('/***Import***/ const ' + last + ' = ' + Android[i] + '')
          lines.sort()

          let lastColumn = editor.lineTextForScreenRow(lastLine + 1).split('').length
          editor.setCursorScreenPosition([firstLine, 0])
          editor.selectToBufferPosition([lastLine + 1, lastColumn])

          editor.insertText(lines.join('\n'))

          lastPosition.row += 1
          editor.setCursorBufferPosition(lastPosition)
        }
      }
    }
  }

};
