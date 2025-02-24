<!--

    Copyright (C) 2020 con terra GmbH (info@conterra.de)

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

            http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

-->
<template>
    <v-container class="sketchingMainContainer" pa-0>
        <v-toolbar flat dense pa-0 class="SketchingToolsBar">
            <top-toolbar height="50" absolute :tools="headerTools" @onToolClick="onToolClickHandler"></top-toolbar>
            <v-flex shrink pa-1>
                <v-layout row wrap>
                    <div v-for="(tool,index) in lastTools" :key="index">
                        <menu-button v-if="tool.menu" :tool="tool" :tools="tools"
                                     @onToolClick="onToolClickHandler" :bus="eventBus"
                                     :hasGraphicsOnLoad="hasGraphicsOnLoad"
                                     :i18n="i18n"></menu-button>
                        <tool-button v-else :tool="tool" @onToolClick="onToolClickHandler" :id="tool.id"
                                     :bus="eventBus"></tool-button>
                    </div>
                </v-layout>
            </v-flex>
        </v-toolbar>
        <v-divider
            class="mx-1"
        ></v-divider>
        <v-layout class="sketchingCenterContainer" row>
            <navigation @onToolClick="onToolClickHandler" :tools="tools" :firstToolGroupIds="firstToolGroupIds"
                        :bus="eventBus" :i18n="i18n"></navigation>
            <v-tabs class="flex grow tabsContainer" v-model="tab" slider-color="primary" grow>
                <v-tab v-for="(item, i) in tabs" :key="i">
                    {{ i18n.measurement[item] }}
                </v-tab>

                <template v-for="(extension, j) in extensionTabs">
                    <v-tab v-if="extensionIsVisible(extension) && !settingsEnabled" :key="(j+tabs.length)">
                        {{ extension.header }}
                    </v-tab>
                </template>

                <v-tabs-items>
                    <template v-for="(item, index) in tabs">
                        <v-container class="pa-2" v-if="!item" :key="'placeholder'-index">{{ i18n.noActiveTool }}
                        </v-container>
                        <v-tab-item v-if="item" :key="index" :value="index">
                            <illustration class="flex grow pa-2" v-if="item === 'drawTab'" :i18n="i18n"
                                          :settings.sync="settings" :tool="currentTool"
                                          v-on:update:settings="settingsChange"
                                          :options="initialSymbolSettings"></illustration>
                            <construction-panel class="flex grow pa-2" v-if="item === 'constructionTab'"
                                                :constructionModel="constructionModel" :tool="currentTool"
                                                :i18n="i18n"></construction-panel>
                            <settings-panel class="flex grow pa-2"
                                            v-if="item === 'Einstellungen'"
                                            @toggleSketchingLayerVisibility="_toggleSketchingVisible"
                                            :sketchingVisible="sketchingVisible"
                                            :bus="eventBus"
                                            :i18n="i18n">
                            </settings-panel>
                        </v-tab-item>
                    </template>
                    <template v-for="(extension, k) in extensionTabs">
                        <v-tab-item :key="(k+tabs.length)" v-if="!settingsEnabled" :value="k+tabs.length">
                            <component v-if="extensionIsVisible(extension)" :is="extension.view"
                                       v-bind="{ ...extension.props }" v-on="extension.events"/>
                        </v-tab-item>
                    </template>
                </v-tabs-items>


            </v-tabs>
        </v-layout>
        <v-container class="pa-1 sketchingFooter">
            <v-btn @click="showSettings" outlined>
                <v-icon>icon-cog</v-icon>
                <span class="pl-2">{{ i18n.settings }}</span>
            </v-btn>
        </v-container>
    </v-container>
</template>

<script>
import Bindable from 'apprt-vue/mixins/Bindable';
import i18n from 'dojo/i18n!./nls/bundle';
import TopToolbar from './components/TopToolbar.vue';
import Illustration from './components/Illustration.vue';
import Navigation from './components/Navigation.vue';
import ConstructionPanel from './components/construction/ConstructionPanel.vue';
import PointSetting from 'dn_sketchingenhanced-symboleditor/model/PointSetting';
import LineSetting from 'dn_sketchingenhanced-symboleditor/model/LineSetting';
import PolygonSetting from 'dn_sketchingenhanced-symboleditor/model/PolygonSetting';
import TextSetting from './model/TextSetting';
import MenuButton from './components/MenuButton.vue';
import ToolButton from './components/ToolButton.vue';
import SketchingFooter from './components/SketchingFooter.vue'
import SettingsPanel from './components/SettingsPanel.vue';

export default {
    mixins: [Bindable],
    components: {
        Navigation,
        Illustration,
        ConstructionPanel,
        TopToolbar,
        SettingsPanel,
        'tool-button': ToolButton,
        'menu-button': MenuButton,
        'sketching-footer': SketchingFooter
    },
    data() {
        return {
            toggle: null,
            notoggle: null,
            symbolSettings: null,
            tab: 0,
            settingsEnabled: false,
            hasGraphicsOnLoad: false,
            eventBus: this,
            elements: [],


            toolSettings: {
                PointSetting: null,
                PolygonSetting: null,
                LineSetting: null,
                TextSetting: null,
            }
        }
    },
    props: {
        i18n: {type: Object, default: () => i18n.ui},
        tools: {
            type: Array,
            default: () => []
        },
        firstToolGroupIds: Array,
        headerToolIds: Array,
        currentSymbol: {
            type: Object,
            required: false,
        },
        initialSymbolSettings: {
            type: Object,
        },
        constructionModel: {
            type: Object, default: () => {
                return {angleModulus: 45, planarLength: 10, use: {angleModulus: false, planarLength: false}};
            },
        },
        lastToolGroupIds: {
            type: Array,
            default: () => []
        },
        sketchingVisible: {
            type: Boolean,
            default: false
        },
        extensionTabs: Array,
    },
    computed: {
        currentTool() {
            return this.tools?.find((tool) => {
                return tool.active;
            });
        },
        tabs() {
            if (this.settingsEnabled) {
                return ['Einstellungen'];
            }
            if (this.currentTool) {
                switch (this.currentTool.id) {
                    case 'drawpolygontool':
                    case 'drawpolylinetool':
                        return ['drawTab', 'constructionTab'];
                    case 'drawcopytool':
                    case 'drawremovetool':
                    case 'drawcircletool':
                        return ['drawTab', 'constructionTab'];
                    case 'drawtexttool':
                    case 'drawfreehandpolygontool':
                    case 'drawfreehandpolylinetool':
                    case 'drawarrowtool':
                    case 'drawellipsetool':
                        return ['drawTab'];
                    case 'drawreshapetool':
                        this.tab = null;
                        return [];
                    default:
                        return ['drawTab'];
                }
            } else {
                return [];
            }
        },
        settings: {
            get() {
                return this.symbolSettings || new PolygonSetting(this.initialSymbolSettings?.polygonSymbol);
            },
            set(val) {
                this.$emit('settingsSelectionChanged', val);
            }
        },
        headerTools() {
            return this._getOverviewTools(this.headerToolIds);
        },
        lastTools() {
            return this._getOverviewTools(this.lastToolGroupIds);
        },
    },
    watch: {
        currentTool(tool) {
            if (tool && tool?.mode !== 'secondary') {
                this._setSettings(tool);
            }
        },
        symbolSettings(value) {
            this.$emit('settingsSelectionChanged', value);
        }
    },
    methods: {
        _getTool(toolId) {
            return this.tools.find(x => x.id === toolId);
        },
        /**
         * creates an array with all tools of an input array where only the ids are listed
         * @param toolIds: Array of Ids
         * @returns Array
         * @private
         */
        _getOverviewTools(toolIds) {
            const tools = [];
            if (toolIds) {
                toolIds.forEach(id => {
                    const tool = this._getTool(id);
                    if (tool) {
                        tools.push(tool);
                    }
                });
            }
            return tools;
        },
        onToolClickHandler(id) {
            this.settingsEnabled = false;
            this.$emit('onToolClick', {id});
            // the style settings have to be reset after each tool change
            this.$emit('settingsSelectionChanged', this.settings);
        },

        transformPointSettingsOrDefault(pointSetting) {
            const pointSettingsTemplate = pointSetting.PointSetting || this.initialSymbolSettings?.pointSymbol;
            return new PointSetting(pointSettingsTemplate, this.initialSymbolSettings?.maxPointSymbolSize);
        },

        _setSettings(tool) {
            const type = tool.type;
            const settings = this.toolSettings;
            switch (type) {
                case 'point': {
                    this.symbolSettings = this.transformPointSettingsOrDefault(settings);
                    if (!settings.PointSetting) {
                        // apply settings to tool
                        settings.PointSetting = this.symbolSettings;
                    }
                    break;
                }
                case 'polyline': {
                    if (!settings.LineSetting) {
                        this.symbolSettings = settings.LineSetting = new LineSetting(this.initialSymbolSettings ? this.initialSymbolSettings.polylineSymbol : '');
                    } else {
                        this.symbolSettings = new LineSetting(settings.LineSetting);
                    }
                    break;
                }
                case 'text': {
                    if (!settings.TextSetting) {
                        this.symbolSettings = settings.TextSetting = new TextSetting(this.initialSymbolSettings ? this.initialSymbolSettings.textSymbol : '')
                    } else {
                        this.symbolSettings = new TextSetting(settings.TextSetting);
                    }
                    break;
                }
                case 'polygon':
                case 'rectangle':
                case 'circle':
                case 'triangle':
                case 'ellipse':
                case 'arrow': {
                    // TODO: new tools with fill pattern must be added here
                    if (!settings.PolygonSetting) {
                        this.symbolSettings = settings.PolygonSetting = new PolygonSetting(this.initialSymbolSettings ? this.initialSymbolSettings.polygonSymbol : '');
                    } else {
                        this.symbolSettings = new PolygonSetting(settings.PolygonSetting);
                    }
                    break;
                }
                default: {
                    break;
                }
            }
        },
        showSettings() {
            this.settingsEnabled = true;
            this.currentTool && this.$emit('onToolClick', {id: this.currentTool.id})
        },
        settingsChange(settings) {
            this.toolSettings[settings.typeName] = settings;
            this.symbolSettings = settings;
        },
        _toggleSketchingVisible(val) {
            //this.sketchingVisible = val;
            this.$emit('toggleSketchingLayerVisibility', val)
        },
        extensionIsVisible(extension) {
            return extension.for.includes(this.currentTool?.id);
        }
    }
}
</script>
