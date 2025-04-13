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
import type { Place } from './Place';
import {
    PlaceFromJSON,
    PlaceFromJSONTyped,
    PlaceToJSON,
} from './Place';

/**
 * 
 * @export
 * @interface Photo
 */
export interface Photo {
    /**
     * 
     * @type {string}
     * @memberof Photo
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof Photo
     */
    url?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Photo
     */
    placeId?: string;
    /**
     * 
     * @type {Place}
     * @memberof Photo
     */
    place?: Place;
}

/**
 * Check if a given object implements the Photo interface.
 */
export function instanceOfPhoto(value: object): value is Photo {
    return true;
}

export function PhotoFromJSON(json: any): Photo {
    return PhotoFromJSONTyped(json, false);
}

export function PhotoFromJSONTyped(json: any, ignoreDiscriminator: boolean): Photo {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'url': json['url'] == null ? undefined : json['url'],
        'placeId': json['placeId'] == null ? undefined : json['placeId'],
        'place': json['place'] == null ? undefined : PlaceFromJSON(json['place']),
    };
}

export function PhotoToJSON(value?: Photo | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'url': value['url'],
        'placeId': value['placeId'],
        'place': PlaceToJSON(value['place']),
    };
}

