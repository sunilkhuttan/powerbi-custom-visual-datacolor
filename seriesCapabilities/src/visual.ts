/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import IColorPalette = powerbi.extensibility.IColorPalette;

import { VisualSettings } from "./settings";
import ISelectionId = powerbi.visuals.ISelectionId;
import PrimitiveValue = powerbi.PrimitiveValue;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewObject = powerbi.DataViewObject;
    /**
     * Interface for BarChart data points.
     *
     * @interface
     * @property {number} value             - Data value for point.
     * @property {string} category          - Corresponding category of data value.
     * @property {string} color             - Color corresponding to data point.
     * @property {ISelectionId} selectionId - Id assigned to data point for cross filtering
     *                                        and visual interaction.
     */
    interface DataPoint {
        value: PrimitiveValue;
        category: string;
        color: string;
        strokeColor?: string;
        strokeWidth?: number;
        selectionId: ISelectionId;
    };

export class Visual implements IVisual {
    private target: HTMLElement;
    private updateCount: number;
    private settings: VisualSettings;
    private textNode: Text;
    private visualHost: IVisualHost;
    private colorPalette: IColorPalette;
    private dataPoints: DataPoint[];

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.visualHost = options.host;
        this.target = options.element;
        this.colorPalette = this.visualHost.colorPalette;
        this.updateCount = 0;
        this.dataPoints = [];

        if (typeof document !== "undefined") {
            const new_p: HTMLElement = document.createElement("p");
            new_p.appendChild(document.createTextNode("Update count:"));
            const new_em: HTMLElement = document.createElement("em");
            this.textNode = document.createTextNode(this.updateCount.toString());
            new_em.appendChild(this.textNode);
            new_p.appendChild(new_em);
            this.target.appendChild(new_p);
        }
    }

    /**
     * TransformData
     */
    public TransformData(options: VisualUpdateOptions, host: IVisualHost): DataPoint[] {
        let data: DataPoint[] = [];
        let categorical = options.dataViews[0].categorical;
        let category = categorical.categories[0];
        let dataValue = categorical.values[0];

        for (let i = 0, len = Math.max(category.values.length, dataValue.values.length); i < len; i++) {

            let defaultColor: any = {
                solid: {
                    color: this.colorPalette.getColor(`${category.values[i]}`).value
                }
            }
            // const color = this.colorPalette.getColor(`${category.values[i]}`).value;
            const color = this.getCategoricalObjectValue(category, i, 'colorSelector', 'fill', defaultColor ).solid.color;

            let val =  dataValue.values[i];
            let cat = `${category.values[i]}`;
            const selectionId: ISelectionId = host.createSelectionIdBuilder()
                .withCategory(category, i)
                .createSelectionId();
            data.push({
                color,
                selectionId,
                value: val,
                category: cat,
            });
            // debugger;
        }

        return data;
    }

    public update(options: VisualUpdateOptions) {
        debugger;
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        console.log('Visual update', options);
        
        this.dataPoints = this.TransformData(options, this.visualHost);
        debugger;
        if (typeof this.textNode !== "undefined") {
            this.textNode.textContent = (this.updateCount++).toString();
        }
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return VisualSettings.parse(dataView) as VisualSettings;
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        let objectEnumeration: VisualObjectInstance[] = [];
        let objectName = options.objectName;
        switch (objectName) {
            case 'colorSelector':
                    for (let barDataPoint of this.dataPoints) {
                        objectEnumeration.push({
                            objectName: objectName,
                            displayName: barDataPoint.category,
                            properties: {
                                fill: {
                                    solid: {
                                        color: barDataPoint.color
                                    }
                                }
                            },
                            selector: barDataPoint.selectionId.getSelector()
                        });
                    }
                    break;
        }

        return objectEnumeration;
        //return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }

    
   public getCategoricalObjectValue<T>(category: DataViewCategoryColumn, index: number, objectName: string, propertyName: string, defaultValue: T): T {
       let categoryObjects = category.objects;
   
       if(categoryObjects) {
           let categoryObject: DataViewObject = categoryObjects[index];
           if(categoryObject) {
               let object = categoryObject[objectName];
               if(object) {
                   let property: T = object[propertyName];
                   if(property !== undefined) {
                       return property;
                   }
               }
           }
       }
       return defaultValue;
   }
}