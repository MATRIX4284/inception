/*
 * Licensed to the Technische Universität Darmstadt under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The Technische Universität Darmstadt
 * licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};


// main/editors/basic/visualization/AnnotationExperienceAPIBasicEditorVisualization.ts
var AnnotationExperienceAPIBasicEditorVisualization = class {
  constructor(aAnnotationExperienceAPIBasicEditor) {
    this.SENTENCE_OFFSET_WIDTH = 45;
    this.CHARACTER_WIDTH = 9;
    this.lineColorFirst = "#BBBBBB";
    this.lineColorSecond = "#CCCCCC";
    this.sentenceBegin = 0;
    this.sentenceCount = 5;
    this.showHighlighting = true;
    this.showSentenceNumbers = true;
    this.showBackground = true;
    this.annotationExperienceAPIBasicEditor = aAnnotationExperienceAPIBasicEditor;
  }
  showText(aElementId) {
    let textArea = document.getElementById(aElementId.toString());
    textArea.innerHTML = "";
    let sentences = this.annotationExperienceAPIBasicEditor.annotationExperienceAPI.viewport.documentText.split(".");
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("version", "1.2");
    svg.setAttribute("viewBox", "0 0 " + textArea.offsetWidth + " " + this.sentenceCount * 20);
    svg.setAttribute("style", "font-size: 100%; width: " + textArea.offsetWidth + "px; height: " + this.sentenceCount * 20 + "px");
    let textElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
    textElement.setAttribute("class", "sentences");
    textElement.style.display = "block";
    let xBegin = 0;
    this.sentenceBegin = Number(document.getElementsByTagName("input")[2].value) - 1;
    if (this.sentenceBegin + this.sentenceCount > sentences.length) {
      this.sentenceCount = sentences.length - this.sentenceBegin;
    }
    if (this.showBackground) {
      svg.appendChild(this.drawBackground());
    }
    if (this.showSentenceNumbers) {
      svg.appendChild(this.drawSentenceNumbers());
      textElement.style.width = (svg.width - this.SENTENCE_OFFSET_WIDTH).toString();
      xBegin = this.SENTENCE_OFFSET_WIDTH;
    }
    let k = 0;
    let xPrev = xBegin;
    for (let i = 0; i < this.sentenceCount; i++) {
      let sentenceOffset = this.calculateInitialOffset(this.sentenceBegin + i);
      let sentence = document.createElementNS("http://www.w3.org/2000/svg", "g");
      sentence.setAttribute("class", "text-row");
      sentence.setAttribute("sentence-id", (this.sentenceBegin + i).toString());
      for (let j = 0; j < sentences[this.sentenceBegin + i].length; j++, k++) {
        let char = document.createElementNS("http://www.w3.org/2000/svg", "text");
        char.textContent = sentences[this.sentenceBegin + i][j];
        char.setAttribute("x", xPrev.toString());
        char.setAttribute("y", ((i + 1) * 20 - 5).toString());
        char.setAttribute("char_pos", (sentenceOffset + j).toString());
        xPrev += this.CHARACTER_WIDTH;
        sentence.appendChild(char);
      }
      textElement.appendChild(sentence);
      xPrev = xBegin;
    }
    svg.appendChild(textElement);
    textArea.appendChild(svg);
    if (this.showHighlighting) {
      svg.appendChild(this.drawAnnotation(this.annotationExperienceAPIBasicEditor.annotationExperienceAPI.spans, aElementId));
    }
  }
  drawBackground() {
    let background = document.createElementNS("http://www.w3.org/2000/svg", "g");
    background.setAttribute("class", "background");
    background.innerHTML = "";
    for (let i = 0; i < this.sentenceCount; i++) {
      let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", "0");
      rect.setAttribute("y", (i * 20).toString());
      rect.setAttribute("width", "100%");
      rect.setAttribute("height", "20");
      if (i % 2 == 0) {
        rect.setAttribute("fill", this.lineColorFirst);
      } else {
        rect.setAttribute("fill", this.lineColorSecond);
      }
      background.appendChild(rect);
    }
    return background;
  }
  calculateInitialOffset(aSentenceNumber) {
    let offset = 0;
    let sentences = this.annotationExperienceAPIBasicEditor.annotationExperienceAPI.viewport.documentText.split(".");
    for (let i = 0; i < aSentenceNumber; i++) {
      let words = sentences[i].split(" ");
      for (let j = 0; j < words.length; j++) {
        offset += words[j].length + 1;
      }
      offset++;
    }
    return offset;
  }
  drawSentenceNumbers() {
    let sentenceNumbers = document.createElementNS("http://www.w3.org/2000/svg", "g");
    sentenceNumbers.setAttribute("class", "sentence_numbers");
    sentenceNumbers.style.display = "block";
    sentenceNumbers.innerHTML = "";
    for (let i = 0; i < this.sentenceCount; i++) {
      let number = document.createElementNS("http://www.w3.org/2000/svg", "text");
      number.textContent = (this.sentenceBegin + i + 1).toString() + ".";
      number.setAttribute("x", "10");
      number.setAttribute("y", ((i + 1) * 20 - 5).toString());
      sentenceNumbers.appendChild(number);
    }
    return sentenceNumbers;
  }
  drawAnnotation(aAnnotations, aEditor) {
    let highlighting = document.createElementNS("http://www.w3.org/2000/svg", "g");
    highlighting.setAttribute("class", "annotations");
    highlighting.style.display = "block";
    highlighting.innerHTML = "";
    if (aAnnotations.length > 0) {
      let sentences = this.annotationExperienceAPIBasicEditor.annotationExperienceAPI.viewport.documentText;
      this.sentenceCount = sentences.length - 1;
      let i = 0;
      let childElement = 0;
      if (this.showBackground) {
        childElement++;
      }
      if (this.showSentenceNumbers) {
        childElement++;
      }
      for (let child of document.getElementById(aEditor).children[0].children[childElement].children) {
        let text_row = document.createElementNS("http://www.w3.org/2000/svg", "g");
        text_row.setAttribute("class", "span");
        for (let span of aAnnotations) {
          let begin;
          let end;
          let check = false;
          let word = "";
          for (let char of child.children) {
            if (span.begin.toString() === char.getAttribute("char_pos")) {
              begin = char.getAttribute("x");
              word = word.concat(char.textContent);
              check = true;
              continue;
            }
            if (span.end.toString() === char.getAttribute("char_pos")) {
              if (begin != null && word === span.coveredText) {
                end = char.getAttribute("x");
                let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                rect.setAttribute("x", Number(begin).toString());
                rect.setAttribute("y", (i * 20).toString());
                rect.setAttribute("width", (Number(end) - Number(begin)).toString());
                rect.setAttribute("height", "20");
                rect.setAttribute("id", String(span.id));
                rect.setAttribute("type", span.type);
                rect.setAttribute("fill", span.color);
                rect.style.opacity = "0.5";
                text_row.appendChild(rect);
                break;
              } else {
                break;
              }
            } else {
              if (check) {
                word = word.concat(char.textContent);
              }
            }
          }
        }
        highlighting.appendChild(text_row);
        i++;
      }
      return highlighting;
    } else {
      return highlighting;
    }
  }
  setLineColors(aLineColorFirst, aLineColorSecond, aEditor) {
    this.lineColorFirst = aLineColorFirst;
    this.lineColorSecond = aLineColorSecond;
    this.refreshEditor(aEditor);
  }
  resetLineColor(aEditor) {
    this.lineColorFirst = "#BBBBBB";
    this.lineColorSecond = "#CCCCCC";
    this.refreshEditor(aEditor);
  }
  refreshEditor(aEditor) {
    this.showText(aEditor);
  }
  setShowHighlighting(aShowHighlighting, aEditor) {
    this.showHighlighting = aShowHighlighting;
    this.refreshEditor(aEditor);
  }
  setShowSentenceNumbers(aShowSentenceNumbers, aEditor) {
    this.showSentenceNumbers = aShowSentenceNumbers;
    this.refreshEditor(aEditor);
  }
  setShowHighLighting(aHighlightingEnabled, aEditor) {
    this.showHighlighting = aHighlightingEnabled;
    this.showText(aEditor);
  }
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/node_modules/@stomp/stompjs/esm6/byte.js
var BYTE = {
  LF: "\n",
  NULL: "\0"
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/node_modules/@stomp/stompjs/esm6/frame-impl.js
var FrameImpl = class {
  constructor(params) {
    const {command, headers, body, binaryBody, escapeHeaderValues, skipContentLengthHeader} = params;
    this.command = command;
    this.headers = Object.assign({}, headers || {});
    if (binaryBody) {
      this._binaryBody = binaryBody;
      this.isBinaryBody = true;
    } else {
      this._body = body || "";
      this.isBinaryBody = false;
    }
    this.escapeHeaderValues = escapeHeaderValues || false;
    this.skipContentLengthHeader = skipContentLengthHeader || false;
  }
  get body() {
    if (!this._body && this.isBinaryBody) {
      this._body = new TextDecoder().decode(this._binaryBody);
    }
    return this._body;
  }
  get binaryBody() {
    if (!this._binaryBody && !this.isBinaryBody) {
      this._binaryBody = new TextEncoder().encode(this._body);
    }
    return this._binaryBody;
  }
  static fromRawFrame(rawFrame, escapeHeaderValues) {
    const headers = {};
    const trim = (str) => str.replace(/^\s+|\s+$/g, "");
    for (const header of rawFrame.headers.reverse()) {
      const idx = header.indexOf(":");
      const key = trim(header[0]);
      let value = trim(header[1]);
      if (escapeHeaderValues && rawFrame.command !== "CONNECT" && rawFrame.command !== "CONNECTED") {
        value = FrameImpl.hdrValueUnEscape(value);
      }
      headers[key] = value;
    }
    return new FrameImpl({
      command: rawFrame.command,
      headers,
      binaryBody: rawFrame.binaryBody,
      escapeHeaderValues
    });
  }
  toString() {
    return this.serializeCmdAndHeaders();
  }
  serialize() {
    const cmdAndHeaders = this.serializeCmdAndHeaders();
    if (this.isBinaryBody) {
      return FrameImpl.toUnit8Array(cmdAndHeaders, this._binaryBody).buffer;
    } else {
      return cmdAndHeaders + this._body + BYTE.NULL;
    }
  }
  serializeCmdAndHeaders() {
    const lines = [this.command];
    if (this.skipContentLengthHeader) {
      delete this.headers["content-length"];
    }
    for (const name of Object.keys(this.headers || {})) {
      const value = this.headers[name];
      if (this.escapeHeaderValues && this.command !== "CONNECT" && this.command !== "CONNECTED") {
        lines.push(`${name}:${FrameImpl.hdrValueEscape(`${value}`)}`);
      } else {
        lines.push(`${name}:${value}`);
      }
    }
    if (this.isBinaryBody || !this.isBodyEmpty() && !this.skipContentLengthHeader) {
      lines.push(`content-length:${this.bodyLength()}`);
    }
    return lines.join(BYTE.LF) + BYTE.LF + BYTE.LF;
  }
  isBodyEmpty() {
    return this.bodyLength() === 0;
  }
  bodyLength() {
    const binaryBody = this.binaryBody;
    return binaryBody ? binaryBody.length : 0;
  }
  static sizeOfUTF8(s) {
    return s ? new TextEncoder().encode(s).length : 0;
  }
  static toUnit8Array(cmdAndHeaders, binaryBody) {
    const uint8CmdAndHeaders = new TextEncoder().encode(cmdAndHeaders);
    const nullTerminator = new Uint8Array([0]);
    const uint8Frame = new Uint8Array(uint8CmdAndHeaders.length + binaryBody.length + nullTerminator.length);
    uint8Frame.set(uint8CmdAndHeaders);
    uint8Frame.set(binaryBody, uint8CmdAndHeaders.length);
    uint8Frame.set(nullTerminator, uint8CmdAndHeaders.length + binaryBody.length);
    return uint8Frame;
  }
  static marshall(params) {
    const frame = new FrameImpl(params);
    return frame.serialize();
  }
  static hdrValueEscape(str) {
    return str.replace(/\\/g, "\\\\").replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/:/g, "\\c");
  }
  static hdrValueUnEscape(str) {
    return str.replace(/\\r/g, "\r").replace(/\\n/g, "\n").replace(/\\c/g, ":").replace(/\\\\/g, "\\");
  }
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/node_modules/@stomp/stompjs/esm6/parser.js
var NULL = 0;
var LF = 10;
var CR = 13;
var COLON = 58;
var Parser = class {
  constructor(onFrame, onIncomingPing) {
    this.onFrame = onFrame;
    this.onIncomingPing = onIncomingPing;
    this._encoder = new TextEncoder();
    this._decoder = new TextDecoder();
    this._token = [];
    this._initState();
  }
  parseChunk(segment, appendMissingNULLonIncoming = false) {
    let chunk;
    if (segment instanceof ArrayBuffer) {
      chunk = new Uint8Array(segment);
    } else {
      chunk = this._encoder.encode(segment);
    }
    if (appendMissingNULLonIncoming && chunk[chunk.length - 1] !== 0) {
      const chunkWithNull = new Uint8Array(chunk.length + 1);
      chunkWithNull.set(chunk, 0);
      chunkWithNull[chunk.length] = 0;
      chunk = chunkWithNull;
    }
    for (let i = 0; i < chunk.length; i++) {
      const byte = chunk[i];
      this._onByte(byte);
    }
  }
  _collectFrame(byte) {
    if (byte === NULL) {
      return;
    }
    if (byte === CR) {
      return;
    }
    if (byte === LF) {
      this.onIncomingPing();
      return;
    }
    this._onByte = this._collectCommand;
    this._reinjectByte(byte);
  }
  _collectCommand(byte) {
    if (byte === CR) {
      return;
    }
    if (byte === LF) {
      this._results.command = this._consumeTokenAsUTF8();
      this._onByte = this._collectHeaders;
      return;
    }
    this._consumeByte(byte);
  }
  _collectHeaders(byte) {
    if (byte === CR) {
      return;
    }
    if (byte === LF) {
      this._setupCollectBody();
      return;
    }
    this._onByte = this._collectHeaderKey;
    this._reinjectByte(byte);
  }
  _reinjectByte(byte) {
    this._onByte(byte);
  }
  _collectHeaderKey(byte) {
    if (byte === COLON) {
      this._headerKey = this._consumeTokenAsUTF8();
      this._onByte = this._collectHeaderValue;
      return;
    }
    this._consumeByte(byte);
  }
  _collectHeaderValue(byte) {
    if (byte === CR) {
      return;
    }
    if (byte === LF) {
      this._results.headers.push([this._headerKey, this._consumeTokenAsUTF8()]);
      this._headerKey = void 0;
      this._onByte = this._collectHeaders;
      return;
    }
    this._consumeByte(byte);
  }
  _setupCollectBody() {
    const contentLengthHeader = this._results.headers.filter((header) => {
      return header[0] === "content-length";
    })[0];
    if (contentLengthHeader) {
      this._bodyBytesRemaining = parseInt(contentLengthHeader[1], 10);
      this._onByte = this._collectBodyFixedSize;
    } else {
      this._onByte = this._collectBodyNullTerminated;
    }
  }
  _collectBodyNullTerminated(byte) {
    if (byte === NULL) {
      this._retrievedBody();
      return;
    }
    this._consumeByte(byte);
  }
  _collectBodyFixedSize(byte) {
    if (this._bodyBytesRemaining-- === 0) {
      this._retrievedBody();
      return;
    }
    this._consumeByte(byte);
  }
  _retrievedBody() {
    this._results.binaryBody = this._consumeTokenAsRaw();
    this.onFrame(this._results);
    this._initState();
  }
  _consumeByte(byte) {
    this._token.push(byte);
  }
  _consumeTokenAsUTF8() {
    return this._decoder.decode(this._consumeTokenAsRaw());
  }
  _consumeTokenAsRaw() {
    const rawResult = new Uint8Array(this._token);
    this._token = [];
    return rawResult;
  }
  _initState() {
    this._results = {
      command: void 0,
      headers: [],
      binaryBody: void 0
    };
    this._token = [];
    this._headerKey = void 0;
    this._onByte = this._collectFrame;
  }
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/node_modules/@stomp/stompjs/esm6/types.js
var StompSocketState;
(function(StompSocketState2) {
  StompSocketState2[StompSocketState2["CONNECTING"] = 0] = "CONNECTING";
  StompSocketState2[StompSocketState2["OPEN"] = 1] = "OPEN";
  StompSocketState2[StompSocketState2["CLOSING"] = 2] = "CLOSING";
  StompSocketState2[StompSocketState2["CLOSED"] = 3] = "CLOSED";
})(StompSocketState || (StompSocketState = {}));
var ActivationState;
(function(ActivationState2) {
  ActivationState2[ActivationState2["ACTIVE"] = 0] = "ACTIVE";
  ActivationState2[ActivationState2["DEACTIVATING"] = 1] = "DEACTIVATING";
  ActivationState2[ActivationState2["INACTIVE"] = 2] = "INACTIVE";
})(ActivationState || (ActivationState = {}));

// ../../../../inception-api-annotation-experimental/src/main/ts/main/node_modules/@stomp/stompjs/esm6/versions.js
var Versions = class {
  constructor(versions) {
    this.versions = versions;
  }
  supportedVersions() {
    return this.versions.join(",");
  }
  protocolVersions() {
    return this.versions.map((x) => `v${x.replace(".", "")}.stomp`);
  }
};
Versions.V1_0 = "1.0";
Versions.V1_1 = "1.1";
Versions.V1_2 = "1.2";
Versions.default = new Versions([
  Versions.V1_0,
  Versions.V1_1,
  Versions.V1_2
]);

// ../../../../inception-api-annotation-experimental/src/main/ts/main/node_modules/@stomp/stompjs/esm6/augment-websocket.js
function augmentWebsocket(webSocket, debug) {
  webSocket.terminate = function() {
    const noOp = () => {
    };
    this.onerror = noOp;
    this.onmessage = noOp;
    this.onopen = noOp;
    const ts = new Date();
    const origOnClose = this.onclose;
    this.onclose = (closeEvent) => {
      const delay = new Date().getTime() - ts.getTime();
      debug(`Discarded socket closed after ${delay}ms, with code/reason: ${closeEvent.code}/${closeEvent.reason}`);
    };
    this.close();
    origOnClose.call(this, {
      code: 4001,
      reason: "Heartbeat failure, discarding the socket",
      wasClean: false
    });
  };
}

// ../../../../inception-api-annotation-experimental/src/main/ts/main/node_modules/@stomp/stompjs/esm6/stomp-handler.js
var StompHandler = class {
  constructor(_client, _webSocket, config = {}) {
    this._client = _client;
    this._webSocket = _webSocket;
    this._serverFrameHandlers = {
      CONNECTED: (frame) => {
        this.debug(`connected to server ${frame.headers.server}`);
        this._connected = true;
        this._connectedVersion = frame.headers.version;
        if (this._connectedVersion === Versions.V1_2) {
          this._escapeHeaderValues = true;
        }
        this._setupHeartbeat(frame.headers);
        this.onConnect(frame);
      },
      MESSAGE: (frame) => {
        const subscription = frame.headers.subscription;
        const onReceive = this._subscriptions[subscription] || this.onUnhandledMessage;
        const message = frame;
        const client = this;
        const messageId = this._connectedVersion === Versions.V1_2 ? message.headers.ack : message.headers["message-id"];
        message.ack = (headers = {}) => {
          return client.ack(messageId, subscription, headers);
        };
        message.nack = (headers = {}) => {
          return client.nack(messageId, subscription, headers);
        };
        onReceive(message);
      },
      RECEIPT: (frame) => {
        const callback = this._receiptWatchers[frame.headers["receipt-id"]];
        if (callback) {
          callback(frame);
          delete this._receiptWatchers[frame.headers["receipt-id"]];
        } else {
          this.onUnhandledReceipt(frame);
        }
      },
      ERROR: (frame) => {
        this.onStompError(frame);
      }
    };
    this._counter = 0;
    this._subscriptions = {};
    this._receiptWatchers = {};
    this._partialData = "";
    this._escapeHeaderValues = false;
    this._lastServerActivityTS = Date.now();
    this.configure(config);
  }
  get connectedVersion() {
    return this._connectedVersion;
  }
  get connected() {
    return this._connected;
  }
  configure(conf) {
    Object.assign(this, conf);
  }
  start() {
    const parser = new Parser((rawFrame) => {
      const frame = FrameImpl.fromRawFrame(rawFrame, this._escapeHeaderValues);
      if (!this.logRawCommunication) {
        this.debug(`<<< ${frame}`);
      }
      const serverFrameHandler = this._serverFrameHandlers[frame.command] || this.onUnhandledFrame;
      serverFrameHandler(frame);
    }, () => {
      this.debug("<<< PONG");
    });
    this._webSocket.onmessage = (evt) => {
      this.debug("Received data");
      this._lastServerActivityTS = Date.now();
      if (this.logRawCommunication) {
        const rawChunkAsString = evt.data instanceof ArrayBuffer ? new TextDecoder().decode(evt.data) : evt.data;
        this.debug(`<<< ${rawChunkAsString}`);
      }
      parser.parseChunk(evt.data, this.appendMissingNULLonIncoming);
    };
    this._onclose = (closeEvent) => {
      this.debug(`Connection closed to ${this._client.brokerURL}`);
      this._cleanUp();
      this.onWebSocketClose(closeEvent);
    };
    this._webSocket.onclose = this._onclose;
    this._webSocket.onerror = (errorEvent) => {
      this.onWebSocketError(errorEvent);
    };
    this._webSocket.onopen = () => {
      const connectHeaders = Object.assign({}, this.connectHeaders);
      this.debug("Web Socket Opened...");
      connectHeaders["accept-version"] = this.stompVersions.supportedVersions();
      connectHeaders["heart-beat"] = [
        this.heartbeatOutgoing,
        this.heartbeatIncoming
      ].join(",");
      this._transmit({command: "CONNECT", headers: connectHeaders});
    };
  }
  _setupHeartbeat(headers) {
    if (headers.version !== Versions.V1_1 && headers.version !== Versions.V1_2) {
      return;
    }
    if (!headers["heart-beat"]) {
      return;
    }
    const [serverOutgoing, serverIncoming] = headers["heart-beat"].split(",").map((v) => parseInt(v, 10));
    if (this.heartbeatOutgoing !== 0 && serverIncoming !== 0) {
      const ttl = Math.max(this.heartbeatOutgoing, serverIncoming);
      this.debug(`send PING every ${ttl}ms`);
      this._pinger = setInterval(() => {
        if (this._webSocket.readyState === StompSocketState.OPEN) {
          this._webSocket.send(BYTE.LF);
          this.debug(">>> PING");
        }
      }, ttl);
    }
    if (this.heartbeatIncoming !== 0 && serverOutgoing !== 0) {
      const ttl = Math.max(this.heartbeatIncoming, serverOutgoing);
      this.debug(`check PONG every ${ttl}ms`);
      this._ponger = setInterval(() => {
        const delta = Date.now() - this._lastServerActivityTS;
        if (delta > ttl * 2) {
          this.debug(`did not receive server activity for the last ${delta}ms`);
          this._closeOrDiscardWebsocket();
        }
      }, ttl);
    }
  }
  _closeOrDiscardWebsocket() {
    if (this.discardWebsocketOnCommFailure) {
      this.debug("Discarding websocket, the underlying socket may linger for a while");
      this._discardWebsocket();
    } else {
      this.debug("Issuing close on the websocket");
      this._closeWebsocket();
    }
  }
  forceDisconnect() {
    if (this._webSocket) {
      if (this._webSocket.readyState === StompSocketState.CONNECTING || this._webSocket.readyState === StompSocketState.OPEN) {
        this._closeOrDiscardWebsocket();
      }
    }
  }
  _closeWebsocket() {
    this._webSocket.onmessage = () => {
    };
    this._webSocket.close();
  }
  _discardWebsocket() {
    if (!this._webSocket.terminate) {
      augmentWebsocket(this._webSocket, (msg) => this.debug(msg));
    }
    this._webSocket.terminate();
  }
  _transmit(params) {
    const {command, headers, body, binaryBody, skipContentLengthHeader} = params;
    const frame = new FrameImpl({
      command,
      headers,
      body,
      binaryBody,
      escapeHeaderValues: this._escapeHeaderValues,
      skipContentLengthHeader
    });
    let rawChunk = frame.serialize();
    if (this.logRawCommunication) {
      this.debug(`>>> ${rawChunk}`);
    } else {
      this.debug(`>>> ${frame}`);
    }
    if (this.forceBinaryWSFrames && typeof rawChunk === "string") {
      rawChunk = new TextEncoder().encode(rawChunk);
    }
    if (typeof rawChunk !== "string" || !this.splitLargeFrames) {
      this._webSocket.send(rawChunk);
    } else {
      let out = rawChunk;
      while (out.length > 0) {
        const chunk = out.substring(0, this.maxWebSocketChunkSize);
        out = out.substring(this.maxWebSocketChunkSize);
        this._webSocket.send(chunk);
        this.debug(`chunk sent = ${chunk.length}, remaining = ${out.length}`);
      }
    }
  }
  dispose() {
    if (this.connected) {
      try {
        const disconnectHeaders = Object.assign({}, this.disconnectHeaders);
        if (!disconnectHeaders.receipt) {
          disconnectHeaders.receipt = `close-${this._counter++}`;
        }
        this.watchForReceipt(disconnectHeaders.receipt, (frame) => {
          this._closeWebsocket();
          this._cleanUp();
          this.onDisconnect(frame);
        });
        this._transmit({command: "DISCONNECT", headers: disconnectHeaders});
      } catch (error) {
        this.debug(`Ignoring error during disconnect ${error}`);
      }
    } else {
      if (this._webSocket.readyState === StompSocketState.CONNECTING || this._webSocket.readyState === StompSocketState.OPEN) {
        this._closeWebsocket();
      }
    }
  }
  _cleanUp() {
    this._connected = false;
    if (this._pinger) {
      clearInterval(this._pinger);
    }
    if (this._ponger) {
      clearInterval(this._ponger);
    }
  }
  publish(params) {
    const {destination, headers, body, binaryBody, skipContentLengthHeader} = params;
    const hdrs = Object.assign({destination}, headers);
    this._transmit({
      command: "SEND",
      headers: hdrs,
      body,
      binaryBody,
      skipContentLengthHeader
    });
  }
  watchForReceipt(receiptId, callback) {
    this._receiptWatchers[receiptId] = callback;
  }
  subscribe(destination, callback, headers = {}) {
    headers = Object.assign({}, headers);
    if (!headers.id) {
      headers.id = `sub-${this._counter++}`;
    }
    headers.destination = destination;
    this._subscriptions[headers.id] = callback;
    this._transmit({command: "SUBSCRIBE", headers});
    const client = this;
    return {
      id: headers.id,
      unsubscribe(hdrs) {
        return client.unsubscribe(headers.id, hdrs);
      }
    };
  }
  unsubscribe(id, headers = {}) {
    headers = Object.assign({}, headers);
    delete this._subscriptions[id];
    headers.id = id;
    this._transmit({command: "UNSUBSCRIBE", headers});
  }
  begin(transactionId) {
    const txId = transactionId || `tx-${this._counter++}`;
    this._transmit({
      command: "BEGIN",
      headers: {
        transaction: txId
      }
    });
    const client = this;
    return {
      id: txId,
      commit() {
        client.commit(txId);
      },
      abort() {
        client.abort(txId);
      }
    };
  }
  commit(transactionId) {
    this._transmit({
      command: "COMMIT",
      headers: {
        transaction: transactionId
      }
    });
  }
  abort(transactionId) {
    this._transmit({
      command: "ABORT",
      headers: {
        transaction: transactionId
      }
    });
  }
  ack(messageId, subscriptionId, headers = {}) {
    headers = Object.assign({}, headers);
    if (this._connectedVersion === Versions.V1_2) {
      headers.id = messageId;
    } else {
      headers["message-id"] = messageId;
    }
    headers.subscription = subscriptionId;
    this._transmit({command: "ACK", headers});
  }
  nack(messageId, subscriptionId, headers = {}) {
    headers = Object.assign({}, headers);
    if (this._connectedVersion === Versions.V1_2) {
      headers.id = messageId;
    } else {
      headers["message-id"] = messageId;
    }
    headers.subscription = subscriptionId;
    return this._transmit({command: "NACK", headers});
  }
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/node_modules/@stomp/stompjs/esm6/client.js
var __awaiter = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var Client = class {
  constructor(conf = {}) {
    this.stompVersions = Versions.default;
    this.connectionTimeout = 0;
    this.reconnectDelay = 5e3;
    this.heartbeatIncoming = 1e4;
    this.heartbeatOutgoing = 1e4;
    this.splitLargeFrames = false;
    this.maxWebSocketChunkSize = 8 * 1024;
    this.forceBinaryWSFrames = false;
    this.appendMissingNULLonIncoming = false;
    this.state = ActivationState.INACTIVE;
    const noOp = () => {
    };
    this.debug = noOp;
    this.beforeConnect = noOp;
    this.onConnect = noOp;
    this.onDisconnect = noOp;
    this.onUnhandledMessage = noOp;
    this.onUnhandledReceipt = noOp;
    this.onUnhandledFrame = noOp;
    this.onStompError = noOp;
    this.onWebSocketClose = noOp;
    this.onWebSocketError = noOp;
    this.logRawCommunication = false;
    this.onChangeState = noOp;
    this.connectHeaders = {};
    this._disconnectHeaders = {};
    this.configure(conf);
  }
  get webSocket() {
    return this._stompHandler ? this._stompHandler._webSocket : void 0;
  }
  get disconnectHeaders() {
    return this._disconnectHeaders;
  }
  set disconnectHeaders(value) {
    this._disconnectHeaders = value;
    if (this._stompHandler) {
      this._stompHandler.disconnectHeaders = this._disconnectHeaders;
    }
  }
  get connected() {
    return !!this._stompHandler && this._stompHandler.connected;
  }
  get connectedVersion() {
    return this._stompHandler ? this._stompHandler.connectedVersion : void 0;
  }
  get active() {
    return this.state === ActivationState.ACTIVE;
  }
  _changeState(state) {
    this.state = state;
    this.onChangeState(state);
  }
  configure(conf) {
    Object.assign(this, conf);
  }
  activate() {
    if (this.state === ActivationState.DEACTIVATING) {
      this.debug("Still DEACTIVATING, please await call to deactivate before trying to re-activate");
      throw new Error("Still DEACTIVATING, can not activate now");
    }
    if (this.active) {
      this.debug("Already ACTIVE, ignoring request to activate");
      return;
    }
    this._changeState(ActivationState.ACTIVE);
    this._connect();
  }
  _connect() {
    return __awaiter(this, void 0, void 0, function* () {
      if (this.connected) {
        this.debug("STOMP: already connected, nothing to do");
        return;
      }
      yield this.beforeConnect();
      if (!this.active) {
        this.debug("Client has been marked inactive, will not attempt to connect");
        return;
      }
      if (this.connectionTimeout > 0) {
        this._connectionWatcher = setTimeout(() => {
          this.debug(`Connection not established in ${this.connectionTimeout}ms, closing socket`);
          this.forceDisconnect();
        }, this.connectionTimeout);
      }
      this.debug("Opening Web Socket...");
      const webSocket = this._createWebSocket();
      this._stompHandler = new StompHandler(this, webSocket, {
        debug: this.debug,
        stompVersions: this.stompVersions,
        connectHeaders: this.connectHeaders,
        disconnectHeaders: this._disconnectHeaders,
        heartbeatIncoming: this.heartbeatIncoming,
        heartbeatOutgoing: this.heartbeatOutgoing,
        splitLargeFrames: this.splitLargeFrames,
        maxWebSocketChunkSize: this.maxWebSocketChunkSize,
        forceBinaryWSFrames: this.forceBinaryWSFrames,
        logRawCommunication: this.logRawCommunication,
        appendMissingNULLonIncoming: this.appendMissingNULLonIncoming,
        discardWebsocketOnCommFailure: this.discardWebsocketOnCommFailure,
        onConnect: (frame) => {
          if (this._connectionWatcher) {
            clearTimeout(this._connectionWatcher);
            this._connectionWatcher = void 0;
          }
          if (!this.active) {
            this.debug("STOMP got connected while deactivate was issued, will disconnect now");
            this._disposeStompHandler();
            return;
          }
          this.onConnect(frame);
        },
        onDisconnect: (frame) => {
          this.onDisconnect(frame);
        },
        onStompError: (frame) => {
          this.onStompError(frame);
        },
        onWebSocketClose: (evt) => {
          this._stompHandler = void 0;
          if (this.state === ActivationState.DEACTIVATING) {
            this._resolveSocketClose();
            this._resolveSocketClose = void 0;
            this._changeState(ActivationState.INACTIVE);
          }
          this.onWebSocketClose(evt);
          if (this.active) {
            this._schedule_reconnect();
          }
        },
        onWebSocketError: (evt) => {
          this.onWebSocketError(evt);
        },
        onUnhandledMessage: (message) => {
          this.onUnhandledMessage(message);
        },
        onUnhandledReceipt: (frame) => {
          this.onUnhandledReceipt(frame);
        },
        onUnhandledFrame: (frame) => {
          this.onUnhandledFrame(frame);
        }
      });
      this._stompHandler.start();
    });
  }
  _createWebSocket() {
    let webSocket;
    if (this.webSocketFactory) {
      webSocket = this.webSocketFactory();
    } else {
      webSocket = new WebSocket(this.brokerURL, this.stompVersions.protocolVersions());
    }
    webSocket.binaryType = "arraybuffer";
    return webSocket;
  }
  _schedule_reconnect() {
    if (this.reconnectDelay > 0) {
      this.debug(`STOMP: scheduling reconnection in ${this.reconnectDelay}ms`);
      this._reconnector = setTimeout(() => {
        this._connect();
      }, this.reconnectDelay);
    }
  }
  deactivate() {
    return __awaiter(this, void 0, void 0, function* () {
      let retPromise;
      if (this.state !== ActivationState.ACTIVE) {
        this.debug(`Already ${ActivationState[this.state]}, ignoring call to deactivate`);
        return Promise.resolve();
      }
      this._changeState(ActivationState.DEACTIVATING);
      if (this._reconnector) {
        clearTimeout(this._reconnector);
      }
      if (this._stompHandler && this.webSocket.readyState !== StompSocketState.CLOSED) {
        retPromise = new Promise((resolve, reject) => {
          this._resolveSocketClose = resolve;
        });
      } else {
        this._changeState(ActivationState.INACTIVE);
        return Promise.resolve();
      }
      this._disposeStompHandler();
      return retPromise;
    });
  }
  forceDisconnect() {
    if (this._stompHandler) {
      this._stompHandler.forceDisconnect();
    }
  }
  _disposeStompHandler() {
    if (this._stompHandler) {
      this._stompHandler.dispose();
      this._stompHandler = null;
    }
  }
  publish(params) {
    this._stompHandler.publish(params);
  }
  watchForReceipt(receiptId, callback) {
    this._stompHandler.watchForReceipt(receiptId, callback);
  }
  subscribe(destination, callback, headers = {}) {
    return this._stompHandler.subscribe(destination, callback, headers);
  }
  unsubscribe(id, headers = {}) {
    this._stompHandler.unsubscribe(id, headers);
  }
  begin(transactionId) {
    return this._stompHandler.begin(transactionId);
  }
  commit(transactionId) {
    this._stompHandler.commit(transactionId);
  }
  abort(transactionId) {
    this._stompHandler.abort(transactionId);
  }
  ack(messageId, subscriptionId, headers = {}) {
    this._stompHandler.ack(messageId, subscriptionId, headers);
  }
  nack(messageId, subscriptionId, headers = {}) {
    this._stompHandler.nack(messageId, subscriptionId, headers);
  }
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/node_modules/@stomp/stompjs/esm6/compatibility/heartbeat-info.js
var HeartbeatInfo = class {
  constructor(client) {
    this.client = client;
  }
  get outgoing() {
    return this.client.heartbeatOutgoing;
  }
  set outgoing(value) {
    this.client.heartbeatOutgoing = value;
  }
  get incoming() {
    return this.client.heartbeatIncoming;
  }
  set incoming(value) {
    this.client.heartbeatIncoming = value;
  }
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/node_modules/@stomp/stompjs/esm6/compatibility/compat-client.js
var CompatClient = class extends Client {
  constructor(webSocketFactory) {
    super();
    this.maxWebSocketFrameSize = 16 * 1024;
    this._heartbeatInfo = new HeartbeatInfo(this);
    this.reconnect_delay = 0;
    this.webSocketFactory = webSocketFactory;
    this.debug = (...message) => {
      console.log(...message);
    };
  }
  _parseConnect(...args) {
    let closeEventCallback;
    let connectCallback;
    let errorCallback;
    let headers = {};
    if (args.length < 2) {
      throw new Error("Connect requires at least 2 arguments");
    }
    if (typeof args[1] === "function") {
      [headers, connectCallback, errorCallback, closeEventCallback] = args;
    } else {
      switch (args.length) {
        case 6:
          [
            headers.login,
            headers.passcode,
            connectCallback,
            errorCallback,
            closeEventCallback,
            headers.host
          ] = args;
          break;
        default:
          [
            headers.login,
            headers.passcode,
            connectCallback,
            errorCallback,
            closeEventCallback
          ] = args;
      }
    }
    return [headers, connectCallback, errorCallback, closeEventCallback];
  }
  connect(...args) {
    const out = this._parseConnect(...args);
    if (out[0]) {
      this.connectHeaders = out[0];
    }
    if (out[1]) {
      this.onConnect = out[1];
    }
    if (out[2]) {
      this.onStompError = out[2];
    }
    if (out[3]) {
      this.onWebSocketClose = out[3];
    }
    super.activate();
  }
  disconnect(disconnectCallback, headers = {}) {
    if (disconnectCallback) {
      this.onDisconnect = disconnectCallback;
    }
    this.disconnectHeaders = headers;
    super.deactivate();
  }
  send(destination, headers = {}, body = "") {
    headers = Object.assign({}, headers);
    const skipContentLengthHeader = headers["content-length"] === false;
    if (skipContentLengthHeader) {
      delete headers["content-length"];
    }
    this.publish({
      destination,
      headers,
      body,
      skipContentLengthHeader
    });
  }
  set reconnect_delay(value) {
    this.reconnectDelay = value;
  }
  get ws() {
    return this.webSocket;
  }
  get version() {
    return this.connectedVersion;
  }
  get onreceive() {
    return this.onUnhandledMessage;
  }
  set onreceive(value) {
    this.onUnhandledMessage = value;
  }
  get onreceipt() {
    return this.onUnhandledReceipt;
  }
  set onreceipt(value) {
    this.onUnhandledReceipt = value;
  }
  get heartbeat() {
    return this._heartbeatInfo;
  }
  set heartbeat(value) {
    this.heartbeatIncoming = value.incoming;
    this.heartbeatOutgoing = value.outgoing;
  }
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/node_modules/@stomp/stompjs/esm6/compatibility/stomp.js
var Stomp = class {
  static client(url, protocols) {
    if (protocols == null) {
      protocols = Versions.default.protocolVersions();
    }
    const wsFn = () => {
      const klass = Stomp.WebSocketClass || WebSocket;
      return new klass(url, protocols);
    };
    return new CompatClient(wsFn);
  }
  static over(ws) {
    let wsFn;
    if (typeof ws === "function") {
      wsFn = ws;
    } else {
      console.warn("Stomp.over did not receive a factory, auto reconnect will not work. Please see https://stomp-js.github.io/api-docs/latest/classes/Stomp.html#over");
      wsFn = () => ws;
    }
    return new CompatClient(wsFn);
  }
};
Stomp.WebSocketClass = null;

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/model/Span.ts
var Span = class {
  constructor(aId, aCoveredText, aBegin, aEnd, aType, aFeatures, aColor) {
    this.id = aId;
    this.coveredText = aCoveredText;
    this.begin = aBegin;
    this.end = aEnd;
    this.type = aType;
    this.features = aFeatures;
    this.color = aColor;
  }
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/messages/response/ErrorMessage.ts
var ErrorMessage = class {
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/messages/request/span/SelectSpanRequest.ts
var SelectSpanRequest = class {
  constructor(aClientName, aProjectId, aDocumentId, aSpanId) {
    this.clientName = aClientName;
    this.projectId = aProjectId;
    this.documentId = aDocumentId;
    this.spanId = aSpanId;
  }
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/messages/request/span/UpdateSpanRequest.ts
var UpdateSpanRequest = class {
  constructor(aClientName, aProjectId, aDocumentId, aSpanId, aNewFeature) {
    this.clientName = aClientName;
    this.projectId = aProjectId;
    this.documentId = aDocumentId;
    this.spanId = aSpanId;
    this.newFeature = aNewFeature;
  }
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/messages/request/span/CreateSpanRequest.ts
var CreateSpanRequest = class {
  constructor(aClientName, aProjectId, aDocumentId, aBegin, aEnd, aLayer) {
    this.clientName = aClientName;
    this.projectId = aProjectId;
    this.documentId = aDocumentId;
    this.begin = aBegin;
    this.end = aEnd;
    this.layer = aLayer;
  }
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/messages/request/span/DeleteSpanRequest.ts
var DeleteSpanRequest = class {
  constructor(aClientName, aProjectId, aDocumentId, aSpanId, aLayer) {
    this.clientName = aClientName;
    this.projectId = aProjectId;
    this.documentId = aDocumentId;
    this.spanId = aSpanId;
    this.layer = aLayer;
  }
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/messages/response/span/SelectSpanResponse.ts
var SelectSpanResponse = class {
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/model/Viewport.ts
var Viewport = class {
  constructor(aViewports, aDisabledLayers, aDocumentText) {
    this.viewport = aViewports;
    this.disabledLayers = aDisabledLayers;
    this.documentText = aDocumentText;
  }
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/messages/response/arc/SelectArcResponse.ts
var SelectArcResponse = class {
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/messages/request/arc/SelectArcRequest.ts
var SelectArcRequest = class {
  constructor(aClientName, aProjectId, aDocumentId, aArcId) {
    this.clientName = aClientName;
    this.projectId = aProjectId;
    this.documentId = aDocumentId;
    this.arcId = aArcId;
  }
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/messages/request/arc/UpdateArcRequest.ts
var UpdateArcRequest = class {
  constructor(aClientName, aProjectId, aDocumentId, aArcId, aNewFeatures) {
    this.clientName = aClientName;
    this.projectId = aProjectId;
    this.documentId = aDocumentId;
    this.arcId = aArcId;
    this.newFeatures = aNewFeatures;
  }
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/messages/request/arc/CreateArcRequest.ts
var CreateArcRequest = class {
  constructor(aClientName, aProjectId, aDocumentId, aSourceId, aTargetId, aLayer) {
    this.clientName = aClientName;
    this.projectId = aProjectId;
    this.documentId = aDocumentId;
    this.sourceId = aSourceId;
    this.targetId = aTargetId;
    this.layer = aLayer;
  }
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/model/Arc.ts
var Arc = class {
  constructor(aId, aSourceId, aTargetId, aSourceCoveredText, aTargetCoveredText, aColor, aType, aFeatures) {
    this.id = aId;
    this.sourceId = aSourceId;
    this.targetId = aTargetId;
    this.sourceCoveredText = aSourceCoveredText;
    this.targetCoveredText = aTargetCoveredText;
    this.color = aColor;
    this.type = aType;
    this.features = aFeatures;
  }
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/messages/response/DocumentResponse.ts
var DocumentResponse = class {
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/messages/response/span/UpdateSpanMessage.ts
var UpdateSpanMessage = class {
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/messages/response/span/CreateSpanMessage.ts
var CreateSpanMessage = class {
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/messages/response/span/DeleteSpanMessage.ts
var DeleteSpanMessage = class {
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/messages/response/arc/UpdateArcMessage.ts
var UpdateArcMessage = class {
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/messages/response/arc/CreateArcMessage.ts
var CreateArcMessage = class {
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/messages/response/arc/DeleteArcMessage.ts
var DeleteArcMessage = class {
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/messages/request/DocumentRequest.ts
var DocumentRequest = class {
  constructor(aClientName, aProjectId, aDocumentId, aViewport) {
    this.clientName = aClientName;
    this.projectId = aProjectId;
    this.documentId = aDocumentId;
    this.viewport = aViewport;
  }
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/messages/request/arc/DeleteArcRequest.ts
var DeleteArcRequest = class {
  constructor(aClientName, aProjectId, aDocumentId, aArcId, aLayer) {
    this.clientName = aClientName;
    this.projectId = aProjectId;
    this.documentId = aDocumentId;
    this.arcId = aArcId;
    this.layer = aLayer;
  }
};

// ../../../../inception-api-annotation-experimental/src/main/ts/main/client/AnnotationExperienceAPIImpl.ts
var AnnotationExperienceAPIImpl = class {
  constructor() {
    this.connect();
  }
  connect() {
    this.stompClient = Stomp.over(function() {
      return new WebSocket(localStorage.getItem("url"));
    });
    const that = this;
    this.stompClient.onConnect = function(frame) {
      that.onConnect(frame);
    };
    this.stompClient.onStompError = function(frame) {
      console.log("Broker reported error: " + frame.headers["message"]);
      console.log("Additional details: " + frame.body);
    };
    this.stompClient.activate();
  }
  onConnect(frame) {
    let that = this;
    const header = frame.headers;
    let data;
    for (data in header) {
      that.clientName = header[data];
      break;
    }
    this.projectID = Number(document.location.href.split("/")[5]);
    this.documentID = Number(document.location.href.split("=")[1].split("&")[0]);
    this.viewport = new Viewport(null, null, null);
    this.stompClient.subscribe("/queue/document/" + that.clientName, function(msg) {
      that.onDocument(Object.assign(new DocumentResponse(), JSON.parse(msg.body)));
    }, {id: "document_request"});
    this.stompClient.subscribe("/queue/select_span/" + that.clientName, function(msg) {
      that.onSpanSelect(Object.assign(new SelectSpanResponse(), JSON.parse(msg.body)));
    }, {id: "selected_span"});
    this.stompClient.subscribe("/queue/select_arc/" + that.clientName, function(msg) {
      that.onArcSelect(Object.assign(new SelectArcResponse(), JSON.parse(msg.body)));
    }, {id: "selected_arc"});
    this.stompClient.subscribe("/queue/error_message/" + that.clientName, function(msg) {
      that.onError(Object.assign(new ErrorMessage(), JSON.parse(msg.body)));
    }, {id: "error_message"});
    this.stompClient.subscribe("/topic/span_update/" + this.projectID + "/" + this.documentID, function(msg) {
      that.onSpanUpdate(Object.assign(new UpdateSpanMessage(), JSON.parse(msg.body)));
    }, {id: "span_update"});
    this.stompClient.subscribe("/topic/span_create/" + this.projectID + "/" + this.documentID, function(msg) {
      that.onSpanCreate(Object.assign(new CreateSpanMessage(), JSON.parse(msg.body)));
    }, {id: "span_create"});
    this.stompClient.subscribe("/topic/span_delete/" + this.projectID + "/" + this.documentID, function(msg) {
      that.onSpanDelete(Object.assign(new DeleteSpanMessage(), JSON.parse(msg.body)));
    }, {id: "span_delete"});
    this.stompClient.subscribe("/topic/arc_update/" + this.projectID + "/" + this.documentID, function(msg) {
      that.onArcUpdate(Object.assign(new UpdateArcMessage(), JSON.parse(msg.body)));
    }, {id: "relation_update"});
    this.stompClient.subscribe("/topic/arc_create/" + this.projectID + "/" + this.documentID, function(msg) {
      that.onArcCreate(Object.assign(new CreateArcMessage(), JSON.parse(msg.body)));
    }, {id: "relation_create"});
    this.stompClient.subscribe("/topic/arc_delete/" + this.projectID + "/" + this.documentID, function(msg) {
      that.onArcDelete(Object.assign(new DeleteArcMessage(), JSON.parse(msg.body)));
    }, {id: "relation_delete"});
  }
  unsubscribe(aChannel) {
    this.stompClient.unsubscribe(aChannel);
  }
  disconnect() {
    this.stompClient.deactivate();
  }
  onDocument(aMessage) {
    this.viewport = aMessage.viewport;
    this.viewport.documentText = this.viewport.documentText.split("\n").join("");
    this.documentID = aMessage.documentId;
    this.spans = aMessage.spans;
    this.arcs = aMessage.arcs;
  }
  onSpanDelete(aMessage) {
    this.spans.forEach((item, index) => {
      if (item.id.toString() === aMessage.spanId.toString()) {
        this.spans.splice(index, 1);
      }
    });
  }
  onSpanCreate(aMessage) {
    let span = new Span(aMessage.spanId, aMessage.coveredText, aMessage.begin, aMessage.end, aMessage.type, aMessage.features, aMessage.color);
    this.spans.push(span);
  }
  onSpanSelect(aMessage) {
    this.selectedSpan = new Span(aMessage.spanId, aMessage.coveredText, aMessage.begin, aMessage.end, aMessage.type, aMessage.feature, aMessage.color);
  }
  onSpanUpdate(aMessage) {
    this.spans[this.spans.findIndex((s) => s.id == aMessage.id)].features = aMessage.feature;
  }
  onError(aMessage) {
    console.log(aMessage);
  }
  onArcCreate(aMessage) {
    let relation = new Arc(aMessage.arcId, aMessage.sourceId, aMessage.targetId, aMessage.sourceCoveredText, aMessage.targetCoveredText, aMessage.color, aMessage.type, aMessage.features);
    this.arcs.push(relation);
  }
  onArcDelete(aMessage) {
    this.arcs.forEach((item, index) => {
      if (item.id === aMessage.arcId) {
        this.arcs.splice(index, 1);
      }
    });
  }
  onArcSelect(aMessage) {
    this.selectedArc = new Arc(aMessage.arcId, aMessage.sourceId, aMessage.targetId, aMessage.sourceCoveredText, aMessage.targetCoveredText, aMessage.color, aMessage.type, aMessage.features);
  }
  onArcUpdate(aMessage) {
    console.log("RECEIVED UPDATE ARC");
    let arc = this.arcs.findIndex((r) => r.id == aMessage.arcId);
    this.arcs[arc].features = aMessage.newFeatures;
  }
  requestCreateArc(aClientName, aProjectId, aDocumentId, aSourceId, aTargetId, aLayer) {
    this.stompClient.publish({
      destination: "/app/arc_create",
      body: JSON.stringify(new CreateArcRequest(aClientName, aProjectId, aDocumentId, aSourceId, aTargetId, aLayer))
    });
  }
  requestCreateSpan(aClientName, aProjectId, aDocumentId, aBegin, aEnd, aLayer) {
    console.log("SENDING: " + aBegin + " _ " + aEnd);
    this.stompClient.publish({
      destination: "/app/span_create",
      body: JSON.stringify(new CreateSpanRequest(aClientName, aProjectId, aDocumentId, aBegin, aEnd, aLayer))
    });
  }
  requestDeleteArc(aClientName, aProjectId, aDocumentId, aArcId, aLayer) {
    this.stompClient.publish({
      destination: "/app/arc_delete",
      body: JSON.stringify(new DeleteArcRequest(aClientName, aProjectId, aDocumentId, aArcId, aLayer))
    });
  }
  requestDeleteSpan(aClientName, aProjectId, aDocumentId, aSpanId, aLayer) {
    this.stompClient.publish({
      destination: "/app/span_delete",
      body: JSON.stringify(new DeleteSpanRequest(aClientName, aProjectId, aDocumentId, aSpanId, aLayer))
    });
  }
  requestDocument(aClientName, aProjectId, aDocumentId) {
    this.stompClient.publish({
      destination: "/app/document_request",
      body: JSON.stringify(new DocumentRequest(aClientName, aProjectId, aDocumentId, this.viewport))
    });
  }
  requestSelectArc(aClientName, aProjectId, aDocumentId, aArcId) {
    this.stompClient.publish({
      destination: "/app/select_arc",
      body: JSON.stringify(new SelectArcRequest(aClientName, aProjectId, aDocumentId, aArcId))
    });
  }
  requestSelectSpan(aClientName, aProjectId, aDocumentId, aSpanId) {
    this.stompClient.publish({
      destination: "/app/select_span",
      body: JSON.stringify(new SelectSpanRequest(aClientName, aProjectId, aDocumentId, aSpanId))
    });
  }
  requestUpdateArc(aClientName, aProjectId, aDocumentId, aArcId, aNewFeature) {
    this.stompClient.publish({
      destination: "/app/update_arc",
      body: JSON.stringify(new UpdateArcRequest(aClientName, aProjectId, aDocumentId, aArcId, aNewFeature))
    });
  }
  requestUpdateSpan(aClientName, aProjectId, aDocumentId, aSpanId, aNewFeature) {
    this.stompClient.publish({
      destination: "/app/update_span",
      body: JSON.stringify(new UpdateSpanRequest(aClientName, aProjectId, aDocumentId, aSpanId, aNewFeature))
    });
  }
};

// main/editors/basic/action/AnnotationExperienceAPIBasicEditorActionHandler.ts
var AnnotationExperienceAPIBasicEditorActionHandler = class {
  constructor(annotationExperienceAPIBasicEditor) {
    this.annotationExperienceAPIBasicEditor = annotationExperienceAPIBasicEditor;
    this.registerDefaultActionHandler();
  }
  registerDefaultActionHandler() {
    let that = this;
    onclick = function(aEvent) {
      let elem = aEvent.target;
      if (elem.className === "far fa-caret-square-right" || "far fa-caret-square-left") {
        setTimeout(function() {
          that.annotationExperienceAPIBasicEditor.annotationExperienceAPI.requestDocument(that.annotationExperienceAPIBasicEditor.annotationExperienceAPI.clientName, that.annotationExperienceAPIBasicEditor.annotationExperienceAPI.projectID, Number(document.location.href.split("=")[1].split("&")[0]));
          setTimeout(function() {
            that.sentences = that.annotationExperienceAPIBasicEditor.annotationExperienceAPI.viewport.documentText.split(".");
            that.annotationExperienceAPIBasicEditor.annotationExperienceAPIVisualization.refreshEditor("textarea");
          }, 2e3);
        }, 200);
      }
      if (elem.className === "fas fa-step-forward" || elem.className === "fas fa-step-backward") {
        setTimeout(function() {
          that.annotationExperienceAPIBasicEditor.annotationExperienceAPIVisualization.refreshEditor("textarea");
        }, 200);
      }
    };
  }
};

// main/editors/basic/AnnotationExperienceAPIBasicEditor.ts
var AnnotationExperienceAPIBasicEditor = class {
  constructor() {
    this.annotationExperienceAPI = new AnnotationExperienceAPIImpl();
    this.annotationExperienceAPIVisualization = new AnnotationExperienceAPIBasicEditorVisualization(this);
    this.annotationExperienceAPIActionHandler = new AnnotationExperienceAPIBasicEditorActionHandler(this);
  }
};
