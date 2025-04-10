"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let _statusBarItem: vscode.StatusBarItem;
  let errorLensEnabled: boolean = true;

  console.log(
    'Congratulations, your extension "inliner-debugger" is now active!'
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("inliner-debugger.enable", () => {
      errorLensEnabled = true;
      console.log("Start");

      const activeTextEditor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (activeTextEditor) {
        updateDecorationsForUri(activeTextEditor.document.uri);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("inliner-debugger.disable", () => {
      errorLensEnabled = false;

      const activeTextEditor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (activeTextEditor) {
        updateDecorationsForUri(activeTextEditor.document.uri);
      }
    })
  );

  function GetErrorBackgroundColor(): string {
    const cfg = vscode.workspace.getConfiguration("inliner-debugger");
    const errorColor: string = cfg.get("errorColor") || "rgba(240,10,0,0.5)";
    return errorColor;
  }

  function GetErrorTextColor(): string {
    const cfg = vscode.workspace.getConfiguration("inliner-debugger");
    const errorTextColor: string =
      cfg.get("errorTextColor") || "rgba(240,240,240,1.0)";
    return errorTextColor;
  }

  function GetWarningBackgroundColor(): string {
    const cfg = vscode.workspace.getConfiguration("inliner-debugger");
    const warningColor: string =
      cfg.get("warningColor") || "rgba(200,100,0,0.5)";
    return warningColor;
  }

  function GetWarningTextColor(): string {
    const cfg = vscode.workspace.getConfiguration("inliner-debugger");
    const warningTextColor: string =
      cfg.get("warningTextColor") || "rgba(240,240,240,1.0)";
    return warningTextColor;
  }

  function GetInfoBackgroundColor(): string {
    const cfg = vscode.workspace.getConfiguration("inliner-debugger");
    const infoTextColor: string = cfg.get("infoColor") || "rgba(40,20,120,0.5)";
    return infoTextColor;
  }

  function GetInfoTextColor(): string {
    const cfg = vscode.workspace.getConfiguration("inliner-debugger");
    const infoTextColor: string =
      cfg.get("infoTextColor") || "rgba(240,240,240,1.0)";
    return infoTextColor;
  }

  function GetHintBackgroundColor(): string {
    const cfg = vscode.workspace.getConfiguration("inliner-debugger");
    const hintColor: string = cfg.get("hintColor") || "rgba(20,120,40,0.5)";
    return hintColor;
  }

  function GetHintTextColor(): string {
    const cfg = vscode.workspace.getConfiguration("inliner-debugger");
    const hintTextColor: string =
      cfg.get("hintTextColor") || "rgba(240,240,240,1.0)";
    return hintTextColor;
  }

  function GetAnnotationFontStyle(): string {
    const cfg = vscode.workspace.getConfiguration("inline-debugger");
    const annotationFontStyle: string = cfg.get("fontStyle") || "italic";
    return annotationFontStyle;
  }

  function GetAnnotationFontWeight(): string {
    const cfg = vscode.workspace.getConfiguration("inline-debugger");
    const annotationFontWeight: string = cfg.get("fontWeight") || "normal";
    return annotationFontWeight;
  }

  function GetAnnotationMargin(): string {
    const cfg = vscode.workspace.getConfiguration("inline-debugger");
    const annotationMargin: string = cfg.get("fontMargin") || "40px";
    return annotationMargin;
  }

  function GetEnabledDiagnosticLevels(): string[] {
    const cfg = vscode.workspace.getConfiguration("inline-debugger");
    const enabledDiagnosticLevels: string[] = cfg.get(
      "enabledDiagnosticLevels"
    ) || ["error", "warning"];
    return enabledDiagnosticLevels;
  }

  function IsErrorLevelEnabled() {
    return GetEnabledDiagnosticLevels().indexOf("error") >= 0;
  }

  function IsWarningLevelEnabled() {
    return GetEnabledDiagnosticLevels().indexOf("warning") >= 0;
  }

  function IsInfoLevelEnabled() {
    return GetEnabledDiagnosticLevels().indexOf("info") >= 0;
  }

  function IsHintLevelEnabled() {
    return GetEnabledDiagnosticLevels().indexOf("hint") >= 0;
  }

  function GetStatusBarControl(): string {
    const cfg = vscode.workspace.getConfiguration("inliner-debugger");
    const statusBarControl: string =
      cfg.get("statusBarControl") || "hide-when-no-issues";
    return statusBarControl;
  }

  function AddAnnotationTextPrefixes(): Boolean {
    const cfg = vscode.workspace.getConfiguration("inliner-debugger");
    const addAnnotationTextPrefixes: Boolean =
      cfg.get("addAnnotationTextPrefixes") || false;
    return addAnnotationTextPrefixes;
  }

  // Create decorator types that we use to amplify lines containing errors, warning, info, etc.
  // createTextEditorDecorationType()
  // DecorationRenderOptions

  let errorLensDecorationType: vscode.TextEditorDecorationType =
    vscode.window.createTextEditorDecorationType({
      isWholeLine: true,
    });

  vscode.languages.onDidChangeDiagnostics(
    (diagnosticChangeEvent) => {
      onChangeDiagnostics(diagnosticChangeEvent);
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidOpenTextDocument(
    (textDocument) => {
      updateDecorationsForUri(textDocument.uri);
    },
    null,
    context.subscriptions
  );

  vscode.window.onDidChangeActiveTextEditor(
    (textEditor) => {
      if (textEditor === undefined) {
        return;
      }
      updateDecorationsForUri(textEditor.document.uri);
    },
    null,
    context.subscriptions
  );

  /**
   * Invoked by onDidChangeDiagnostics() when the language diagnostics change.
   *
   * @param {vscode.DiagnosticChangeEvent} diagnosticChangeEvent - Contains info about the change in diagnostics.
   */
  function onChangeDiagnostics(
    diagnosticChangeEvent: vscode.DiagnosticChangeEvent
  ) {
    if (!vscode.window) {
      console.log("Exit onChangeDiagnostics() - !vscode.window");
      return;
    }

    const activeTextEditor: vscode.TextEditor | undefined =
      vscode.window.activeTextEditor;

    if (!activeTextEditor) {
      console.log("Exit onChangeDiagnostics() - !activeTextEditor");
      return;
    }

    for (const uri of diagnosticChangeEvent.uris) {
      if (uri.fsPath === activeTextEditor.document.uri.fsPath) {
        // UpdateDecorationsForUri(uri);
        break;
      }
    }
  }

  /**
   * Update the editor decorations for the provided URI. Only if the URI scheme is "file" is the function
   * processed. (It can be others, such as "git://<something>", in which case the function early-exists).
   *
   * @param {vscode.Uri} uriToDecorate - Uri to add decorations to.
   */
  function updateDecorationsForUri(uriToDecorate: vscode.Uri) {
    if (!uriToDecorate) {
      console.log("Exit updateDecorationsForUri() - uriToDecorate = empty");
      return;
    }

    // Only process "file://" URIs.
    if (uriToDecorate.scheme !== "file") {
      return;
    }

    if (!vscode.window) {
      console.log("Exit updateDecorationsForUri() - !vscode.window");
      return;
    }

    const activeTextEditor: vscode.TextEditor | undefined =
      vscode.window.activeTextEditor;
    if (!activeTextEditor) {
      console.log("Exit updateDecorationsForUri() - !activeTextEditor");
      return;
    }

    if (!activeTextEditor.document.uri.fsPath) {
      console.log(
        "Exit updateDecorationsForUri() - !activeTextEditor.document.uri.fsPath = empty"
      );
      return;
    }

    const errorLensDecorationOptions: vscode.DecorationOptions[] = [];
    let numErrors = 0;
    let numWarnings = 0;

    /**
     * The aggregatedDiagnostics object will contain one or more objects, each object being keyed by "lineN",
     * where N is the source line where one or more diagnostics are being reported.
     * Each object which is keyed by "lineN" will contain one or more arrayDiagnostics[] array of objects.
     * This facilitates gathering info about lines which contian more than one diagnostic.
     *
     *{
     * 	line28: {
     * 		line: 28,
     * 		arrayDiagnostics: [ <vscode.Diagnostics #1> ]
     * 	},
     * 	line67: {
     * 		line: 67,
     * 		arrayDiagnostics: [ <vscode.Diagnostics #1>, <vscode.Diagnostics #2> ]
     * 	},
     * 	line93: {
     * 		line: 93,
     * 		arrayDiagnostics: [ <vscode.Diagnostics #1> ]
     * 	},
     * };
     *
     */

    if (errorLensEnabled) {
      let aggregatedDiagnostics: any = {};
      let diagnostic: vscode.Diagnostic;

      // Iterate over each diagnostics that VS Code has reported for this file. For each one, add to a list
      // of objects, grouping together diagnostics which occur on a single line.

      for (diagnostic of vscode.languages.getDiagnostics(uriToDecorate)) {
        let key = "line" + diagnostic.range.start.line;

        if (aggregatedDiagnostics[key]) {
          aggregatedDiagnostics[key].arrayDiagnostics.push(diagnostic);
        } else {
          aggregatedDiagnostics[key] = {
            line: diagnostic.range.start.line,
            arrayDiagnostics: [diagnostic],
          };
        }

        switch (diagnostic.severity) {
          case 0:
            numErrors += 1;
            break;

          case 1:
            numWarnings += 1;
            break;
        }
      }

      let key: any;
      for (key in aggregatedDiagnostics) {
        let aggregatedDiagnostic = aggregatedDiagnostics[key];
        let addMessagePrefix: Boolean = AddAnnotationTextPrefixes();
        let messagePrefix: string = "";

        if (addMessagePrefix) {
          if (aggregatedDiagnostic.arrayDiagnostics.length > 1) {
            messagePrefix = aggregatedDiagnostic.arrayDiagnostics.length + ": ";
          } else {
            switch (aggregatedDiagnostic.arrayDiagnostics[0].severity) {
              case 0:
                messagePrefix += "Error";
                break;

              case 1:
                messagePrefix += "Warning";
                break;

              case 2:
                messagePrefix += "Info";
                break;
              case 3:
              default:
                messagePrefix += "Hint";
                break;
            }
          }
        }

        let decorationBackgroundColor, decorationTextColor;
        let addErrorLens = false;
        switch (aggregatedDiagnostic.arrayDiagnostics[0].severity) {
          case 0:
            if (IsErrorLevelEnabled()) {
              addErrorLens = true;
              decorationBackgroundColor = GetErrorBackgroundColor();
              decorationTextColor = GetErrorTextColor();
            }
            break;

          case 1:
            if (IsWarningLevelEnabled()) {
              addErrorLens = true;
              decorationBackgroundColor = GetWarningBackgroundColor();
              decorationTextColor = GetWarningTextColor();
            }
            break;
        }

        if (addErrorLens) {
          const decInstanceRenderOptions: vscode.DecorationInstanceRenderOptions =
            {
              after: {
                contentText:
                  messagePrefix +
                  aggregatedDiagnostic.arrayDiagnostics[0].message,
                fontStyle: GetAnnotationFontStyle(),
                fontWeight: GetAnnotationFontWeight(),
                margin: GetAnnotationMargin(),
                color: decorationTextColor,
                backgroundColor: decorationBackgroundColor,
              },
            };

          const diagnosticDecorationOptions: vscode.DecorationOptions = {
            range: aggregatedDiagnostic.arrayDiagnostics[0].range,
            renderOptions: decInstanceRenderOptions,
          };

          errorLensDecorationOptions.push(diagnosticDecorationOptions);
        }
      }
    }

    activeTextEditor.setDecorations(
      errorLensDecorationType,
      errorLensDecorationOptions
    );

    updateStatusBar(numErrors, numWarnings);
  }

  /**
   * Update the Visual Studio Code status bar, showing the number of warnings and/or errors.
   * Control over when (or if) to show the ErrorLens info in the status bar is controlled via the
   * errorLens.statusBarControl configuraions property.
   *
   * @params {number} numErrors - The number of error diagnostics reported
   * @params {number} numWarnings - The number of warning diagnostics reported
   *
   */

  function updateStatusBar(numErrors: number, numWarnings: number) {
    if (!_statusBarItem) {
      _statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left
      );
    }

    const statusBarControl = GetStatusBarControl();
    var showStatusBarText = false;
    if (errorLensEnabled) {
      if (statusBarControl === "always") {
        showStatusBarText = true;
      } else if (statusBarControl === "never") {
        showStatusBarText = false;
      } else if (statusBarControl === "hide-when-no-issues") {
        if (numErrors + numWarnings > 0) {
          showStatusBarText = true;
        }
      }
    }

    const activeTextEditor: vscode.TextEditor | undefined =
      vscode.window.activeTextEditor;
    if (!activeTextEditor || showStatusBarText === false) {
      _statusBarItem.hide();
    } else {
      let statusBarText: string = "";

      if (numErrors + numWarnings === 0) {
        statusBarText = "ErrorLens: No Errors or warnings";
      } else {
        statusBarText =
          "$(bug) ErrorLens: " +
          numErrors +
          " errors, " +
          numWarnings +
          " warnings";
      }

      _statusBarItem.text = statusBarText;
      _statusBarItem.show();
    }
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
