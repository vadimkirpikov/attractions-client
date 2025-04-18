/* tslint:disable */
/* eslint-disable */
/**
 * TouristServer
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface FilterDto
 */
export interface FilterDto {
    /**
     * 
     * @type {Array<string>}
     * @memberof FilterDto
     */
    categoryIds?: Array<string> | null;
    /**
     * 
     * @type {Array<string>}
     * @memberof FilterDto
     */
    districtIds?: Array<string> | null;
    /**
     * 
     * @type {number}
     * @memberof FilterDto
     */
    constMin?: number | null;
    /**
     * 
     * @type {number}
     * @memberof FilterDto
     */
    constMax?: number | null;
}

/**
 * Check if a given object implements the FilterDto interface.
 */
export function instanceOfFilterDto(value: object): value is FilterDto {
    return true;
}

export function FilterDtoFromJSON(json: any): FilterDto {
    return FilterDtoFromJSONTyped(json, false);
}

export function FilterDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): FilterDto {
    if (json == null) {
        return json;
    }
    return {
        
        'categoryIds': json['categoryIds'] == null ? undefined : json['categoryIds'],
        'districtIds': json['districtIds'] == null ? undefined : json['districtIds'],
        'constMin': json['constMin'] == null ? undefined : json['constMin'],
        'constMax': json['constMax'] == null ? undefined : json['constMax'],
    };
}

export function FilterDtoToJSON(value?: FilterDto | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'categoryIds': value['categoryIds'],
        'districtIds': value['districtIds'],
        'constMin': value['constMin'],
        'constMax': value['constMax'],
    };
}

