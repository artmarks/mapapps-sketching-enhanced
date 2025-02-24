/*
 * Copyright (C) 2020 con terra GmbH (info@conterra.de)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {expect} from "chai";
import module from "module";
import _drawTextHelpLine from '../DrawTextHelpLine';

function createHandler() {
    return new _drawTextHelpLine();
}

describe(module.id, function () {
    it("Check line calculation for 90 angle", function () {
        const handler = createHandler();
        const viewModel = {view: {extent: {height: 100}}};
        const angle = 90;
        const [dx, dy] = handler._calculateLine(viewModel, angle);
        expect(-20).to.equal(dy);
        const test = ((dx < 1e-14 && dx > 0) || (dx > -1e-14 && dx < 0));
        expect(test).to.be.true;
    });
    it("Check line calculation for 180 angle", function () {
        const handler = createHandler();
        const viewModel = {view: {extent: {height: 100}}};
        const angle = 180;
        const [dx, dy] = handler._calculateLine(viewModel, angle);

        const test = ((dy < 1e-14 && dy > 0) || (dy > -1e-14 && dy < 0));
        expect(test).to.be.true;

        expect(-20).to.equal(dx);
    });
    it("Check line calculation for 270 angle", function () {
        const handler = createHandler();
        const viewModel = {view: {extent: {height: 100}}};
        const angle = 270;
        const [dx, dy] = handler._calculateLine(viewModel, angle);

        const test = ((dx < 1e-14 && dx > 0) || (dx > -1e-14 && dx < 0));
        expect(test).to.be.true;

        expect(20).to.equal(dy);
    });
    it("Check line calculation for 360 angle", function () {
        const handler = createHandler();
        const viewModel = {view: {extent: {height: 100}}};
        const angle = 360;
        const [dx, dy] = handler._calculateLine(viewModel, angle);

        const test = ((dy < 1e-14 && dy > 0) || (dy > -1e-14 && dy < 0));
        expect(test).to.be.true;

        expect(20).to.equal(dx);
    });
    it("Check line calculation for 45 angle", function () {
        const handler = createHandler();
        const viewModel = {view: {extent: {height: 100}}};
        const angle = 45;
        const [dx, dy] = handler._calculateLine(viewModel, angle);

        expect(-20 * Math.sin(Math.PI / 4)).to.equal(dy);
        expect(20 * Math.cos(Math.PI / 4)).to.equal(dx);
    });
    it("Get correct degree angle with given rotation", function () {
        const handler = createHandler();
        const viewModel = null;
        const rotation = 45;

        const angle = handler._getAngle(viewModel, rotation);
        expect(angle).to.equal(45);
    });
    it("Get correct degree angle with no given rotation, activated drawreshapetool and no _orgSymbols", function () {
        const handler = createHandler();
        const viewModel = {
            tool: {
                toolId: 'drawreshapetool',
            },
            textSymbol: {
                angle: 60,
            },
        };
        const angle = handler._getAngle(viewModel);
        expect(angle).to.equal(60);
    });
    it("Get correct degree angle with no given rotation, activated drawreshapetool and _orgSymbols", function () {
        const handler = createHandler();
        const viewModel = {
            tool: {
                toolId: 'drawreshapetool',
            },
            textSymbol: {
                angle: 60,
            },
            _orgSymbols: [{
                type: 'text',
                angle: 45,
            }],
        };
        const angle = handler._getAngle(viewModel);
        expect(angle).to.equal(45);
    });

});
