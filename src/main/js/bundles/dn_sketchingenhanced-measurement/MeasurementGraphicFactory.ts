///
/// Copyright (C) 2020 con terra GmbH (info@conterra.de)
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///         http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import type Geometry from "esri/geometry/Geometry";
import Graphic from "esri/Graphic";
import TextSymbol from "esri/symbols/TextSymbol";

export class MeasurementGraphicFactory {
    textSettings: __esri.TextSymbolProperties;

    constructor(textSettings: __esri.TextSymbolProperties) {
        this.textSettings = textSettings;
    }

    createGraphic(label: string, geometry: Geometry, id, symbolOptions?: __esri.TextSymbolProperties): Graphic {
        //TODO: Check which types id might have
        const textSymbol = new TextSymbol();
        // apply styling
        Object.keys(this.textSettings).filter(x => x !== 'type').forEach(x => Object.assign(textSymbol, { [x]: this.textSettings[x] }));
        textSymbol.text = label;
        // apply data attributes
        Object.assign(textSymbol, {
            id: `measurement-${id}`,
            ...symbolOptions,
        });
        const graphic = new Graphic({ geometry, symbol: textSymbol });
        if (typeof id === "string") {
            graphic.setAttribute("id", id);
        } else {
            graphic.setAttribute("id", `measurement-${id}`);
        }
        graphic.setAttribute("type", graphic.symbol.type);

        return graphic;
    }
}