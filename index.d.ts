import React, { CSSProperties, PropsWithChildren, FunctionComponent, Ref, ReactNode } from 'react';
import { importLibrary } from '@googlemaps/js-api-loader';

type CustomElement<
  P,
  E extends HTMLElement = HTMLElement
> = React.DetailedHTMLProps<React.HTMLAttributes<E>, E> & P;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-advanced-marker': CustomElement<
        {
          position?: google.maps.LatLngLiteral | string | null;
          title?: string | null;
          anchorLeft?: string | null;
          anchorTop?: string | null;
          collisionBehavior?: google.maps.CollisionBehavior | null;
          gmpClickable?: boolean | null;
          gmpDraggable?: boolean | null;
          map?: google.maps.Map | null;
          zIndex?: number | null;

          /** @deprecated */
          readonly element?: HTMLElement;

          /** @deprecated */
          content?: string;

          'gmp-clickable'?: boolean;
          'anchor-left'?: string;
          'anchor-top'?: string;
        },
        google.maps.marker.AdvancedMarkerElement
      >;

      'gmp-pin': CustomElement<
        {
          background?: string | null;
          borderColor?: string | null;
          glyphColor?: string | null;
          glyphSrc?: URL | string | null;
          glyphText?: string | null;

          scale?: number | string;
          readonly element?: HTMLElement;

          /** @deprecated */
          glyph?: string | Element | URL | null;

          'border-color'?: string;
          'glyph-color'?: string;
          'glyph-src'?: string;
          'glyph-text'?: string;
        },
        google.maps.marker.PinElement
      >;
    }
  }
}

// Internal types for JSX intrinsic elements - not exported
// Component props are defined separately in the component files
type Map3DElementProps = {
  bounds?:
    | google.maps.LatLngBounds
    | google.maps.LatLngBoundsLiteral
    | string
    | null;
  center?:
    | google.maps.LatLngAltitude
    | google.maps.LatLngAltitudeLiteral
    | string
    | null;
  heading?: number | string | null;
  mode?: google.maps.maps3d.MapMode | string | null;
  range?: number | string | null;
  roll?: number | string | null;
  tilt?: number | string | null;

  /** @deprecated */
  defaultUIDisabled?: boolean | null;
  defaultUIHidden?: boolean | null;
  maxAltitude?: number | null;
  maxHeading?: number | null;
  maxTilt?: number | null;
  minAltitude?: number | null;
  minHeading?: number | null;
  minTilt?: number | null;

  /** @deprecated */
  'default-ui-disabled'?: boolean | string;
  'default-ui-hidden'?: boolean | string;
  'max-altitude'?: string;
  'max-heading'?: string;
  'max-tilt'?: string;
  'min-altitude'?: string;
  'min-heading'?: string;
  'min-tilt'?: string;
};

type Marker3DElementProps = {
  extruded?: boolean | string | null;
  label?: string | null;
  position?:
    | google.maps.LatLngLiteral
    | google.maps.LatLngAltitudeLiteral
    | string
    | null;

  altitudeMode?: google.maps.maps3d.AltitudeMode | null;
  collisionBehavior?: google.maps.CollisionBehavior | null;
  drawsWhenOccluded?: boolean | null;
  sizePreserved?: boolean | null;
  zIndex?: number | null;

  'altitude-mode'?: string;
  'collision-behavior'?: string;
  'draws-when-occluded'?: boolean | string;
  'size-preserved'?: boolean | string;
  'z-index'?: string;
};

type Model3DProps = {
  orientation?:
    | google.maps.Orientation3D
    | google.maps.Orientation3DLiteral
    | string
    | null;
  position?:
    | google.maps.LatLngLiteral
    | google.maps.LatLngAltitude
    | google.maps.LatLngAltitudeLiteral
    | string
    | null;
  scale?:
    | number
    | google.maps.Vector3D
    | google.maps.Vector3DLiteral
    | string
    | null;
  src?: string | URL | null;

  altitudeMode?: google.maps.maps3d.AltitudeMode | null;

  'altitude-mode'?: string;
};

type Polyline3DProps = {
  extruded?: boolean | string | null;
  geodesic?: boolean | string | null;
  path?: string | null;

  altitudeMode?: google.maps.maps3d.AltitudeMode | null;
  coordinates?: Iterable<
    | google.maps.LatLngAltitude
    | google.maps.LatLngAltitudeLiteral
    | google.maps.LatLngLiteral
  > | null;
  drawsOccludedSegments?: boolean | null;
  outerColor?: string | null;
  outerWidth?: number | null;
  strokeColor?: string | null;
  strokeWidth?: number | null;
  zIndex?: number | null;

  'altitude-mode'?: string;
  'draws-occluded-segments'?: boolean | string;
  'outer-color'?: string;
  'outer-width'?: string;
  'stroke-color'?: string;
  'stroke-width'?: string;
  'z-index'?: string;
};

type Polygon3DProps = {
  extruded?: boolean | string | null;
  geodesic?: boolean | string | null;
  path?: string | null;

  altitudeMode?: google.maps.maps3d.AltitudeMode | null;
  drawsOccludedSegments?: boolean | null;
  fillColor?: string | null;
  innerCoordinates?: Iterable<
    | Iterable<google.maps.LatLngAltitude | google.maps.LatLngAltitudeLiteral>
    | Iterable<google.maps.LatLngLiteral>
  > | null;
  outerCoordinates?: Iterable<
    | google.maps.LatLngAltitude
    | google.maps.LatLngAltitudeLiteral
    | google.maps.LatLngLiteral
  > | null;
  strokeColor?: string | null;
  strokeWidth?: number | null;
  zIndex?: number | null;

  'altitude-mode'?: string;
  'draws-occluded-segments'?: boolean | string;
  'fill-color'?: string;
  'inner-paths'?: string;
  'stroke-color'?: string;
  'stroke-width'?: string;
  'z-index'?: string;
};

type PopoverElementProps = {
  open?: boolean | string | null;

  altitudeMode?: google.maps.maps3d.AltitudeMode | null;
  lightDismissDisabled?: boolean | null;
  positionAnchor?:
    | google.maps.LatLngLiteral
    | google.maps.LatLngAltitudeLiteral
    | google.maps.maps3d.Marker3DInteractiveElement
    | string
    | null;

  'altitude-mode'?: string;
  'light-dismiss-disabled'?: boolean | string;
  'position-anchor'?: string;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-map-3d': CustomElement<Map3DElementProps, google.maps.Map3DElement>;

      'gmp-marker-3d': CustomElement<
        Marker3DElementProps,
        google.maps.Marker3DElement
      >;

      'gmp-marker-3d-interactive': CustomElement<
        Marker3DElementProps & {
          title?: string;
          gmpPopoverTargetElement?: google.maps.maps3d.PopoverElement | null;
          'gmp-popover-target-element'?: string;
        },
        google.maps.Marker3DInteractiveElement
      >;

      'gmp-model-3d': CustomElement<Model3DProps, google.maps.Model3DElement>;

      'gmp-model-3d-interactive': CustomElement<
        Model3DProps,
        google.maps.Model3DInteractiveElement
      >;

      'gmp-polyline-3d': CustomElement<
        Polyline3DProps,
        google.maps.Polyline3DElement
      >;

      'gmp-polyline-3d-interactive': CustomElement<
        Polyline3DProps,
        google.maps.Polyline3DInteractiveElement
      >;

      'gmp-polygon-3d': CustomElement<
        Polygon3DProps,
        google.maps.Polygon3DElement
      >;

      'gmp-polygon-3d-interactive': CustomElement<
        Polygon3DProps,
        google.maps.Polygon3DInteractiveElement
      >;

      'gmp-popover': CustomElement<
        PopoverElementProps,
        google.maps.PopoverElement
      >;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type NoAttributes = {};
type NoChildren = {children?: never};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      // ================================
      // ======== Places Widgets ========
      // ================================

      'gmp-place-autocomplete': CustomElement<
        // FIXME: the PlaceAutocompleteElementOptions type in @types/google.maps isn't the one defined in the docs.
        //   https://developers.google.com/maps/documentation/javascript/reference/places-widget
        {
          includedPrimaryTypes?: string[] | null;
          includedRegionCodes?: string[] | null;
          locationBias?: google.maps.places.LocationBias | null;
          locationRestriction?: google.maps.places.LocationRestriction | null;
          name?: string | null;
          origin?:
            | google.maps.LatLng
            | google.maps.LatLngLiteral
            | google.maps.LatLngAltitude
            | google.maps.LatLngAltitudeLiteral
            | string
            | null;
          requestedLanguage?: string | null;
          requestedRegion?: string | null;
          unitSystem?: google.maps.UnitSystem | null;

          // html-attribute versions for props
          'included-primary-types'?: string;
          'included-region-codes'?: string;
          'requested-language'?: string;
          'requested-region'?: string;
          'unit-system'?: string;

          // emits 'gmp-error' and 'gmp-select'
        },
        google.maps.places.PlaceAutocompleteElement
      >;

      // FIXME: this doesn't exist in types, not sure of its relevance. In types, it seems
      //   identical to the gmp-place-autocomplete. See
      //   https://developers.google.com/maps/documentation/javascript/reference/places-widget
      'gmp-basic-place-autocomplete': JSX.IntrinsicElements['gmp-place-autocomplete'];

      // alpha only
      'gmp-place-contextual': CustomElement<
        {
          contextToken?: string | null;
          // html-attribute versions
          'context-token'?: string;
        },
        google.maps.places.PlaceContextualElement
      >;

      // alpha only
      'gmp-place-contextual-list-config': CustomElement<
        {
          layout?: google.maps.places.PlaceContextualListLayout | string | null;
          mapHidden?: boolean | null;

          'map-hidden'?: string | boolean;
        },
        google.maps.places.PlaceContextualListConfigElement
      >;

      'gmp-place-details': CustomElement<
        {readonly place?: google.maps.places.Place | null},
        google.maps.places.PlaceDetailsElement

        // emits 'gmp-error' and 'gmp-load' events
      >;

      'gmp-place-details-compact': CustomElement<
        {
          readonly place?: google.maps.places.Place | null;
          orientation?:
            | google.maps.places.PlaceDetailsOrientation
            | string
            | null;
          truncationPreferred?: boolean | null;

          // html-attribute versions
          'truncation-preferred'?: string | boolean;
        },
        google.maps.places.PlaceDetailsCompactElement
      >;

      'gmp-place-details-place-request': CustomElement<
        {
          place?: google.maps.places.Place | string | null;
        },
        google.maps.places.PlaceDetailsPlaceRequestElement
      >;

      'gmp-place-details-location-request': CustomElement<
        {
          location?:
            | google.maps.LatLng
            | google.maps.LatLngLiteral
            | google.maps.LatLngAltitude
            | google.maps.LatLngAltitudeLiteral
            | string
            | null;
        },
        google.maps.places.PlaceDetailsLocationRequestElement
      >;

      'gmp-place-search': CustomElement<
        {
          attributionPosition?: google.maps.places.PlaceSearchAttributionPosition | null;
          orientation?:
            | google.maps.places.PlaceSearchOrientation
            | string
            | null;
          places?: google.maps.places.Place[] | null;
          selectable?: boolean | null;
          truncationPreferred?: boolean | null;

          'attribution-position'?: string;
          'truncation-preferred'?: string | boolean;

          // emits 'gmp-error', 'gmp-load' and 'gmp-select'
        },
        google.maps.places.PlaceSearchElement
      >;

      'gmp-place-nearby-search-request': CustomElement<
        {
          excludedPrimaryTypes?: string[] | null;
          excludedTypes?: string[] | null;
          includedPrimaryTypes?: string[] | null;
          includedTypes?: string[] | null;
          locationRestriction?:
            | google.maps.Circle
            | google.maps.CircleLiteral
            | null;
          maxResultCount?: number | null;
          rankPreference?: google.maps.places.SearchNearbyRankPreference | null;

          // html-attribute versions
          'excluded-primary-types'?: string;
          'excluded-types'?: string;
          'included-primary-types'?: string;
          'included-types'?: string;
          'max-result-count'?: string | number;
          'rank-preference'?: string;
        },
        google.maps.places.PlaceNearbySearchRequestElement
      >;

      'gmp-place-text-search-request': CustomElement<
        {
          evConnectorTypes?: google.maps.places.EVConnectorType[] | null;
          evMinimumChargingRateKw?: number | null;
          includedType?: string | null;
          isOpenNow?: boolean | null;
          locationBias?: google.maps.places.LocationBias | null;
          locationRestriction?:
            | google.maps.LatLngBounds
            | google.maps.LatLngBoundsLiteral
            | null;
          maxResultCount?: number | null;
          minRating?: number | null;
          priceLevels?: google.maps.places.PriceLevel[] | null;
          rankPreference?: google.maps.places.SearchByTextRankPreference | null;
          textQuery?: string | null;
          useStrictTypeFiltering?: boolean | null;

          // html-attribute versions
          'ev-connector-types'?: string;
          'ev-minimum-charging-rate-kw'?: string | number;
          'included-type'?: string;
          'is-open-now'?: string | boolean;
          'location-bias'?: string;
          'location-restriction'?: string;
          'max-result-count'?: string | number;
          'min-rating'?: string | number;
          'price-levels'?: string;
          'rank-preference'?: string;
          'use-strict-type-filtering'?: string | boolean;
        },
        google.maps.places.PlaceTextSearchRequestElement
      >;

      // ====================================================
      // ======== Place Widget Content Customization ========
      // ====================================================

      'gmp-place-content-config': CustomElement<
        NoAttributes,
        google.maps.places.PlaceContentConfigElement
      >;

      'gmp-place-all-content': CustomElement<
        NoChildren,
        google.maps.places.PlaceAllContentElement
      >;

      'gmp-place-standard-content': CustomElement<
        NoChildren,
        google.maps.places.PlaceStandardContentElement
      >;

      'gmp-place-media': CustomElement<
        {
          lightboxPreferred?: boolean | null;
          preferredSize?: google.maps.places.MediaSize | null;

          // html-attribute versions
          'lightbox-preferred'?: string | boolean;
          'preferred-size'?: string;
        },
        google.maps.places.PlaceMediaElement
      >;

      'gmp-place-address': CustomElement<
        NoChildren,
        google.maps.places.PlaceAddressElement
      >;

      'gmp-place-rating': CustomElement<
        NoChildren,
        google.maps.places.PlaceRatingElement
      >;

      'gmp-place-type': CustomElement<
        NoChildren,
        google.maps.places.PlaceTypeElement
      >;

      'gmp-place-price': CustomElement<
        NoChildren,
        google.maps.places.PlacePriceElement
      >;

      'gmp-place-accessible-entrance-icon': CustomElement<
        NoChildren,
        google.maps.places.PlaceAccessibleEntranceIconElement
      >;

      'gmp-place-open-now-status': CustomElement<
        NoChildren,
        google.maps.places.PlaceOpenNowStatusElement
      >;

      'gmp-place-reviews': CustomElement<
        NoChildren,
        google.maps.places.PlaceReviewsElement
      >;

      'gmp-place-summary': CustomElement<
        NoChildren,
        google.maps.places.PlaceSummaryElement
      >;

      'gmp-place-feature-list': CustomElement<
        NoChildren,
        google.maps.places.PlaceFeatureListElement
      >;

      'gmp-place-opening-hours': CustomElement<
        NoChildren,
        google.maps.places.PlaceOpeningHoursElement
      >;

      'gmp-place-phone-number': CustomElement<
        NoChildren,
        google.maps.places.PlacePhoneNumberElement
      >;

      'gmp-place-plus-code': CustomElement<
        NoChildren,
        google.maps.places.PlacePlusCodeElement
      >;

      'gmp-place-type-specific-highlights': CustomElement<
        NoChildren,
        google.maps.places.PlaceTypeSpecificHighlightsElement
      >;

      'gmp-place-website': CustomElement<
        NoChildren,
        google.maps.places.PlaceWebsiteElement
      >;

      'gmp-place-attribution': CustomElement<
        {
          darkSchemeColor?: google.maps.places.AttributionColor | null;
          lightSchemeColor?: google.maps.places.AttributionColor | null;

          // html-attribute versions
          'dark-scheme-color'?: string;
          'light-scheme-color'?: string;
        },
        google.maps.places.PlaceAttributionElement
      >;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-air-quality': CustomElement<
        {
          location?:
            | google.maps.LatLng
            | google.maps.LatLngLiteral
            | google.maps.LatLngAltitude
            | google.maps.LatLngAltitudeLiteral
            | string
            | null;

          requestedLanguage?: string | null;

          // html-attribute versions
          'requested-language'?: string;
        },
        google.maps.airQuality.AirQualityElement
      >;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-elevation': CustomElement<
        {
          path?: Array<
            | google.maps.LatLng
            | google.maps.LatLngLiteral
            | google.maps.LatLngAltitude
            | google.maps.LatLngAltitudeLiteral
          > | null;
          unitSystem?: google.maps.UnitSystem | null;

          // html-attribute versions
          'unit-system'?: string;

          // emits 'gmp-requesterror' and 'gmp-load' events
        },
        google.maps.elevation.ElevationElement
      >;
    }
  }
}

declare const VERSION = "__PACKAGE_VERSION__";

interface AdvancedMarkerContextValue {
    marker: google.maps.marker.AdvancedMarkerElement;
}
/**
 * Copy of the `google.maps.CollisionBehavior` constants.
 * They have to be duplicated here since we can't wait for the maps API to load to be able to use them.
 */
declare const CollisionBehavior: {
    readonly REQUIRED: "REQUIRED";
    readonly REQUIRED_AND_HIDES_OPTIONAL: "REQUIRED_AND_HIDES_OPTIONAL";
    readonly OPTIONAL_AND_HIDES_LOWER_PRIORITY: "OPTIONAL_AND_HIDES_LOWER_PRIORITY";
};
type CollisionBehavior = (typeof CollisionBehavior)[keyof typeof CollisionBehavior];
declare const AdvancedMarkerContext: React.Context<AdvancedMarkerContextValue | null>;
/**
 * @deprecated Using `anchorPosition` is deprecated.
 *   Use `anchorLeft` and `anchorTop` instead.
 */
declare const AdvancedMarkerAnchorPoint: {
    readonly TOP_LEFT: readonly ["0%", "0%"];
    readonly TOP_CENTER: readonly ["50%", "0%"];
    readonly TOP: readonly ["50%", "0%"];
    readonly TOP_RIGHT: readonly ["100%", "0%"];
    readonly LEFT_CENTER: readonly ["0%", "50%"];
    readonly LEFT_TOP: readonly ["0%", "0%"];
    readonly LEFT: readonly ["0%", "50%"];
    readonly LEFT_BOTTOM: readonly ["0%", "100%"];
    readonly RIGHT_TOP: readonly ["100%", "0%"];
    readonly RIGHT: readonly ["100%", "50%"];
    readonly RIGHT_CENTER: readonly ["100%", "50%"];
    readonly RIGHT_BOTTOM: readonly ["100%", "100%"];
    readonly BOTTOM_LEFT: readonly ["0%", "100%"];
    readonly BOTTOM_CENTER: readonly ["50%", "100%"];
    readonly BOTTOM: readonly ["50%", "100%"];
    readonly BOTTOM_RIGHT: readonly ["100%", "100%"];
    readonly CENTER: readonly ["50%", "50%"];
};
type AdvancedMarkerAnchorPoint = (typeof AdvancedMarkerAnchorPoint)[keyof typeof AdvancedMarkerAnchorPoint];
type AdvancedMarkerEventProps = {
    onClick?: (e: google.maps.MapMouseEvent) => void;
    onMouseEnter?: (e: google.maps.MapMouseEvent['domEvent']) => void;
    onMouseLeave?: (e: google.maps.MapMouseEvent['domEvent']) => void;
    onDrag?: (e: google.maps.MapMouseEvent) => void;
    onDragStart?: (e: google.maps.MapMouseEvent) => void;
    onDragEnd?: (e: google.maps.MapMouseEvent) => void;
};
type AdvancedMarkerProps = PropsWithChildren<Omit<google.maps.marker.AdvancedMarkerElementOptions, 'gmpDraggable' | 'gmpClickable' | 'content' | 'map' | 'collisionBehavior'> & AdvancedMarkerEventProps & {
    draggable?: boolean;
    clickable?: boolean;
    collisionBehavior?: CollisionBehavior;
    /**
     * @deprecated Use `anchorLeft` and `anchorTop` instead.
     *
     * The anchor point for the Advanced Marker.
     * Either use one of the predefined anchor point from the "AdvancedMarkerAnchorPoint" export
     * or provide a string tuple in the form of ["xPosition", "yPosition"].
     * The position is measured from the top-left corner and
     * can be anything that can be consumed by a CSS translate() function.
     * For example in percent ("50%") or in pixels ("20px").
     */
    anchorPoint?: AdvancedMarkerAnchorPoint | [string, string];
    /**
     * A CSS length-percentage value which is used to offset the anchor point of the marker from the top left corner of the marker. This is useful when using a visual which has an anchor point that is different than the typical bottom center point of the default marker. The default value is "-%50".
     */
    anchorLeft?: string;
    /**
     * A CSS length-percentage value which is used to offset the anchor point of the marker from the top left corner of the marker. This is useful when using a visual which has an anchor point that is different than the typical bottom center point of the default marker. The default value is "-%100".
     */
    anchorTop?: string;
    /**
     * A className for the content element.
     * (can only be used with HTML Marker content)
     */
    className?: string;
    /**
     * Additional styles to apply to the content element.
     */
    style?: CSSProperties;
}>;
declare const AdvancedMarker: React.ForwardRefExoticComponent<Omit<google.maps.marker.AdvancedMarkerElementOptions, "gmpDraggable" | "gmpClickable" | "content" | "map" | "collisionBehavior"> & AdvancedMarkerEventProps & {
    draggable?: boolean;
    clickable?: boolean;
    collisionBehavior?: CollisionBehavior;
    /**
     * @deprecated Use `anchorLeft` and `anchorTop` instead.
     *
     * The anchor point for the Advanced Marker.
     * Either use one of the predefined anchor point from the "AdvancedMarkerAnchorPoint" export
     * or provide a string tuple in the form of ["xPosition", "yPosition"].
     * The position is measured from the top-left corner and
     * can be anything that can be consumed by a CSS translate() function.
     * For example in percent ("50%") or in pixels ("20px").
     */
    anchorPoint?: AdvancedMarkerAnchorPoint | [string, string];
    /**
     * A CSS length-percentage value which is used to offset the anchor point of the marker from the top left corner of the marker. This is useful when using a visual which has an anchor point that is different than the typical bottom center point of the default marker. The default value is "-%50".
     */
    anchorLeft?: string;
    /**
     * A CSS length-percentage value which is used to offset the anchor point of the marker from the top left corner of the marker. This is useful when using a visual which has an anchor point that is different than the typical bottom center point of the default marker. The default value is "-%100".
     */
    anchorTop?: string;
    /**
     * A className for the content element.
     * (can only be used with HTML Marker content)
     */
    className?: string;
    /**
     * Additional styles to apply to the content element.
     */
    style?: CSSProperties;
} & {
    children?: React.ReactNode | undefined;
} & React.RefAttributes<google.maps.marker.AdvancedMarkerElement>>;
declare function useAdvancedMarkerRef(): readonly [(m: AdvancedMarkerRef | null) => void, google.maps.marker.AdvancedMarkerElement | null];
declare function isAdvancedMarker(marker: google.maps.Marker | google.maps.marker.AdvancedMarkerElement): marker is google.maps.marker.AdvancedMarkerElement;
type CustomMarkerContent = HTMLDivElement | null;
type AdvancedMarkerRef = google.maps.marker.AdvancedMarkerElement | null;

declare const APILoadingStatus: {
    readonly NOT_LOADED: "NOT_LOADED";
    readonly LOADING: "LOADING";
    readonly LOADED: "LOADED";
    readonly FAILED: "FAILED";
    readonly AUTH_FAILURE: "AUTH_FAILURE";
};
type APILoadingStatus = (typeof APILoadingStatus)[keyof typeof APILoadingStatus];

type ImportLibraryFunction = typeof importLibrary;
type GoogleMapsLibrary = Awaited<ReturnType<ImportLibraryFunction>>;
type LoadedLibraries = {
    [name: string]: GoogleMapsLibrary;
};
interface APIProviderContextValue {
    status: APILoadingStatus;
    loadedLibraries: LoadedLibraries;
    importLibrary: typeof importLibrary;
    mapInstances: Record<string, google.maps.Map>;
    addMapInstance: (map: google.maps.Map, id?: string) => void;
    removeMapInstance: (id?: string) => void;
    clearMapInstances: () => void;
    map3dInstances: Record<string, google.maps.maps3d.Map3DElement>;
    addMap3DInstance: (map3d: google.maps.maps3d.Map3DElement, id?: string) => void;
    removeMap3DInstance: (id?: string) => void;
    clearMap3DInstances: () => void;
    internalUsageAttributionIds: string[] | null;
}
declare const APIProviderContext: React.Context<APIProviderContextValue | null>;
type APIProviderProps = PropsWithChildren<{
    /**
     * apiKey must be provided to load the Google Maps JavaScript API. To create an API key, see: https://developers.google.com/maps/documentation/javascript/get-api-key
     * Part of:
     */
    apiKey: string;
    /**
     * A custom id to reference the script tag can be provided. The default is set to 'google-maps-api'
     * @default 'google-maps-api'
     */
    libraries?: Array<string>;
    /**
     * A specific version of the Google Maps JavaScript API can be used.
     * Read more about versioning: https://developers.google.com/maps/documentation/javascript/versions
     * Part of: https://developers.google.com/maps/documentation/javascript/url-params
     */
    version?: string;
    /**
     * Sets the map to a specific region.
     * Read more about localizing the Map: https://developers.google.com/maps/documentation/javascript/localization
     * Part of: https://developers.google.com/maps/documentation/javascript/url-params
     */
    region?: string;
    /**
     * Use a specific language for the map.
     * Read more about localizing the Map: https://developers.google.com/maps/documentation/javascript/localization
     * Part of: https://developers.google.com/maps/documentation/javascript/url-params
     */
    language?: string;
    /**
     * auth_referrer_policy can be set to 'origin'.
     * Part of: https://developers.google.com/maps/documentation/javascript/url-params
     */
    authReferrerPolicy?: string;
    /**
     * To track usage of Google Maps JavaScript API via numeric channels.
     * The only acceptable channel values are numbers from 0-999.
     * Read more in the
     * [documentation](https://developers.google.com/maps/reporting-and-monitoring/reporting#usage-tracking-per-channel)
     */
    channel?: number;
    /**
     * To understand usage and ways to improve our solutions, Google includes the
     * `solution_channel` query parameter in API calls to gather information about
     * code usage. You may opt out at any time by setting this attribute to an
     * empty string. Read more in the
     * [documentation](https://developers.google.com/maps/reporting-and-monitoring/reporting#solutions-usage).
     */
    solutionChannel?: string;
    /**
     * To help Google understand which libraries and samples are helpful to developers, such as usage of this library.
     * To opt out of sending the usage attribution ID, use this boolean prop. Read more in the
     * [documentation](https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions.internalUsageAttributionIds).
     */
    disableUsageAttribution?: boolean;
    /**
     * A function that can be used to execute code after the Google Maps JavaScript API has been loaded.
     */
    onLoad?: () => void;
    /**
     * A function that will be called if there was an error when loading the Google Maps JavaScript API.
     */
    onError?: (error: unknown) => void;
    /**
     * A function that returns a Promise resolving to an App Check token.
     * When provided, it will be set on `google.maps.Settings.getInstance().fetchAppCheckToken`
     * after the Google Maps JavaScript API has been loaded.
     */
    fetchAppCheckToken?: () => Promise<google.maps.MapsAppCheckTokenResult>;
}>;
/**
 * Component to wrap the components from this library and load the Google Maps JavaScript API
 */
declare const APIProvider: FunctionComponent<APIProviderProps>;
/**
 * @internal
 * Resets module-level state for testing purposes only.
 * This should never be used in production code.
 */
declare function __resetModuleState(): void;

type CircleEventProps = {
    onClick?: (e: google.maps.MapMouseEvent) => void;
    onDrag?: (e: google.maps.MapMouseEvent) => void;
    onDragStart?: (e: google.maps.MapMouseEvent) => void;
    onDragEnd?: (e: google.maps.MapMouseEvent) => void;
    onMouseOver?: (e: google.maps.MapMouseEvent) => void;
    onMouseOut?: (e: google.maps.MapMouseEvent) => void;
    onRadiusChanged?: (radius: number) => void;
    onCenterChanged?: (center: google.maps.LatLng | null | undefined) => void;
};
type CircleProps = Omit<google.maps.CircleOptions, 'map' | 'center' | 'radius'> & CircleEventProps & {
    /** Controlled center position */
    center?: google.maps.LatLngLiteral | google.maps.LatLng;
    /** Uncontrolled initial center position */
    defaultCenter?: google.maps.LatLngLiteral | google.maps.LatLng;
    /** Controlled radius in meters */
    radius?: number;
    /** Uncontrolled initial radius in meters */
    defaultRadius?: number;
};
type CircleRef = Ref<google.maps.Circle | null>;
declare const Circle: React.ForwardRefExoticComponent<Omit<google.maps.CircleOptions, "map" | "center" | "radius"> & CircleEventProps & {
    /** Controlled center position */
    center?: google.maps.LatLngLiteral | google.maps.LatLng;
    /** Uncontrolled initial center position */
    defaultCenter?: google.maps.LatLngLiteral | google.maps.LatLng;
    /** Controlled radius in meters */
    radius?: number;
    /** Uncontrolled initial radius in meters */
    defaultRadius?: number;
} & React.RefAttributes<google.maps.Circle>>;

type InfoWindowProps = Omit<google.maps.InfoWindowOptions, 'headerContent' | 'content' | 'pixelOffset'> & {
    style?: CSSProperties;
    className?: string;
    anchor?: google.maps.Marker | google.maps.marker.AdvancedMarkerElement | null;
    pixelOffset?: [number, number];
    shouldFocus?: boolean;
    onClose?: () => void;
    onCloseClick?: () => void;
    headerContent?: ReactNode;
};
/**
 * Component to render an Info Window with the Maps JavaScript API
 */
declare const InfoWindow: FunctionComponent<PropsWithChildren<InfoWindowProps>>;

/**
 * Handlers for all events that could be emitted by map-instances.
 */
type MapEventProps = Partial<{
    onBoundsChanged: (event: MapCameraChangedEvent) => void;
    onCenterChanged: (event: MapCameraChangedEvent) => void;
    onHeadingChanged: (event: MapCameraChangedEvent) => void;
    onTiltChanged: (event: MapCameraChangedEvent) => void;
    onZoomChanged: (event: MapCameraChangedEvent) => void;
    onCameraChanged: (event: MapCameraChangedEvent) => void;
    onClick: (event: MapMouseEvent) => void;
    onDblclick: (event: MapMouseEvent) => void;
    onContextmenu: (event: MapMouseEvent) => void;
    onMousemove: (event: MapMouseEvent) => void;
    onMouseover: (event: MapMouseEvent) => void;
    onMouseout: (event: MapMouseEvent) => void;
    onDrag: (event: MapEvent) => void;
    onDragend: (event: MapEvent) => void;
    onDragstart: (event: MapEvent) => void;
    onTilesLoaded: (event: MapEvent) => void;
    onIdle: (event: MapEvent) => void;
    onProjectionChanged: (event: MapEvent) => void;
    onIsFractionalZoomEnabledChanged: (event: MapEvent) => void;
    onMapCapabilitiesChanged: (event: MapEvent) => void;
    onMapTypeIdChanged: (event: MapEvent) => void;
    onRenderingTypeChanged: (event: MapEvent) => void;
}>;
type MapEvent<T = unknown> = {
    type: string;
    map: google.maps.Map;
    detail: T;
    stoppable: boolean;
    stop: () => void;
    domEvent?: MouseEvent | TouchEvent | PointerEvent | KeyboardEvent | Event;
};
type MapMouseEvent = MapEvent<{
    latLng: google.maps.LatLngLiteral | null;
    placeId: string | null;
}>;
type MapCameraChangedEvent = MapEvent<{
    center: google.maps.LatLngLiteral;
    bounds: google.maps.LatLngBoundsLiteral;
    zoom: number;
    heading: number;
    tilt: number;
}>;

type DeckGlCompatProps = {
    /**
     * Viewport from deck.gl
     */
    viewport?: unknown;
    /**
     * View state from deck.gl
     */
    viewState?: Record<string, unknown>;
    /**
     * Initial View State from deck.gl
     */
    initialViewState?: Record<string, unknown>;
};

interface GoogleMapsContextValue {
    map: google.maps.Map | null;
}
declare const GoogleMapsContext: React.Context<GoogleMapsContextValue | null>;

type MapCameraProps = {
    center: google.maps.LatLngLiteral;
    zoom: number;
    heading?: number;
    tilt?: number;
};
declare const ColorScheme: {
    readonly DARK: "DARK";
    readonly LIGHT: "LIGHT";
    readonly FOLLOW_SYSTEM: "FOLLOW_SYSTEM";
};
type ColorScheme = (typeof ColorScheme)[keyof typeof ColorScheme];
declare const RenderingType: {
    readonly VECTOR: "VECTOR";
    readonly RASTER: "RASTER";
    readonly UNINITIALIZED: "UNINITIALIZED";
};
type RenderingType = (typeof RenderingType)[keyof typeof RenderingType];
/**
 * Props for the Map Component
 */
type MapProps = PropsWithChildren<Omit<google.maps.MapOptions, 'renderingType' | 'colorScheme'> & MapEventProps & DeckGlCompatProps & {
    /**
     * An id for the map, this is required when multiple maps are present
     * in the same APIProvider context.
     */
    id?: string;
    /**
     * Additional style rules to apply to the map dom-element.
     */
    style?: CSSProperties;
    /**
     * Additional css class-name to apply to the element containing the map.
     */
    className?: string;
    /**
     * The color-scheme to use for the map.
     */
    colorScheme?: ColorScheme;
    /**
     * The rendering-type to be used.
     */
    renderingType?: RenderingType;
    /**
     * Indicates that the map will be controlled externally. Disables all controls provided by the map itself.
     */
    controlled?: boolean;
    /**
     * Enable caching of map-instances created by this component.
     */
    reuseMaps?: boolean;
    defaultCenter?: google.maps.LatLngLiteral;
    defaultZoom?: number;
    defaultHeading?: number;
    defaultTilt?: number;
    /**
     * Alternative way to specify the default camera props as a geographic region that should be fully visible
     */
    defaultBounds?: google.maps.LatLngBoundsLiteral & {
        padding?: number | google.maps.Padding;
    };
}>;
declare const Map: FunctionComponent<MapProps>;

type PolygonEventProps = {
    onClick?: (e: google.maps.MapMouseEvent) => void;
    onDrag?: (e: google.maps.MapMouseEvent) => void;
    onDragStart?: (e: google.maps.MapMouseEvent) => void;
    onDragEnd?: (e: google.maps.MapMouseEvent) => void;
    onMouseOver?: (e: google.maps.MapMouseEvent) => void;
    onMouseOut?: (e: google.maps.MapMouseEvent) => void;
    onPathsChanged?: (paths: google.maps.LatLng[][]) => void;
};
type PathsType = google.maps.MVCArray<google.maps.MVCArray<google.maps.LatLng>> | google.maps.MVCArray<google.maps.LatLng> | Array<google.maps.LatLng | google.maps.LatLngLiteral> | Array<Array<google.maps.LatLng | google.maps.LatLngLiteral>>;
type PolygonProps = Omit<google.maps.PolygonOptions, 'map' | 'paths'> & PolygonEventProps & {
    /**
     * An existing Polygon instance to use instead of creating a new one.
     * Other props will still be applied to this instance.
     */
    polygon?: google.maps.Polygon;
    /**
     * An array of encoded polyline strings as created by the encoding algorithm.
     * (https://developers.google.com/maps/documentation/utilities/polylinealgorithm)
     * When provided, will be decoded and used as the paths.
     * Takes precedence over the `paths` prop if both are specified.
     */
    encodedPaths?: string[];
    /** Controlled paths */
    paths?: PathsType;
    /** Uncontrolled initial paths */
    defaultPaths?: PathsType;
};
type PolygonRef = Ref<google.maps.Polygon | null>;
declare const Polygon: React.ForwardRefExoticComponent<Omit<google.maps.PolygonOptions, "map" | "paths"> & PolygonEventProps & {
    /**
     * An existing Polygon instance to use instead of creating a new one.
     * Other props will still be applied to this instance.
     */
    polygon?: google.maps.Polygon;
    /**
     * An array of encoded polyline strings as created by the encoding algorithm.
     * (https://developers.google.com/maps/documentation/utilities/polylinealgorithm)
     * When provided, will be decoded and used as the paths.
     * Takes precedence over the `paths` prop if both are specified.
     */
    encodedPaths?: string[];
    /** Controlled paths */
    paths?: PathsType;
    /** Uncontrolled initial paths */
    defaultPaths?: PathsType;
} & React.RefAttributes<google.maps.Polygon>>;

type PolylineEventProps = {
    onClick?: (e: google.maps.MapMouseEvent) => void;
    onDrag?: (e: google.maps.MapMouseEvent) => void;
    onDragStart?: (e: google.maps.MapMouseEvent) => void;
    onDragEnd?: (e: google.maps.MapMouseEvent) => void;
    onMouseOver?: (e: google.maps.MapMouseEvent) => void;
    onMouseOut?: (e: google.maps.MapMouseEvent) => void;
    onPathChanged?: (path: google.maps.LatLng[]) => void;
};
type PathType = google.maps.MVCArray<google.maps.LatLng> | Array<google.maps.LatLng | google.maps.LatLngLiteral>;
type PolylineProps = Omit<google.maps.PolylineOptions, 'map' | 'path'> & PolylineEventProps & {
    /**
     * An existing Polyline instance to use instead of creating a new one.
     * Other props will still be applied to this instance.
     */
    polyline?: google.maps.Polyline;
    /**
     * An encoded polyline string as created by the encoding algorithm.
     * (https://developers.google.com/maps/documentation/utilities/polylinealgorithm)
     * When provided, will be decoded and used as the path.
     * Takes precedence over the `path` prop if both are specified.
     */
    encodedPath?: string;
    /** Controlled path */
    path?: PathType;
    /** Uncontrolled initial path */
    defaultPath?: PathType;
};
type PolylineRef = Ref<google.maps.Polyline | null>;
declare const Polyline: React.ForwardRefExoticComponent<Omit<google.maps.PolylineOptions, "map" | "path"> & PolylineEventProps & {
    /**
     * An existing Polyline instance to use instead of creating a new one.
     * Other props will still be applied to this instance.
     */
    polyline?: google.maps.Polyline;
    /**
     * An encoded polyline string as created by the encoding algorithm.
     * (https://developers.google.com/maps/documentation/utilities/polylinealgorithm)
     * When provided, will be decoded and used as the path.
     * Takes precedence over the `path` prop if both are specified.
     */
    encodedPath?: string;
    /** Controlled path */
    path?: PathType;
    /** Uncontrolled initial path */
    defaultPath?: PathType;
} & React.RefAttributes<google.maps.Polyline>>;

/**
 * Base event type for all Map3D events.
 */
interface Map3DEvent {
    type: string;
    map3d: google.maps.maps3d.Map3DElement;
}
/**
 * Event fired when a camera property changes.
 */
interface Map3DCameraChangedEvent extends Map3DEvent {
    detail: {
        center: google.maps.LatLngAltitudeLiteral;
        range: number;
        heading: number;
        tilt: number;
        roll: number;
    };
}
/**
 * Event fired when the map is clicked.
 */
interface Map3DClickEvent extends Map3DEvent {
    detail: {
        position: google.maps.LatLngAltitude | null;
        placeId?: string;
    };
}
/**
 * Event fired when the map's steady state changes.
 */
interface Map3DSteadyChangeEvent extends Map3DEvent {
    detail: {
        isSteady: boolean;
    };
}
/**
 * Props for Map3D event handlers.
 */
interface Map3DEventProps {
    /** Called when the center property changes. */
    onCenterChanged?: (event: Map3DCameraChangedEvent) => void;
    /** Called when the heading property changes. */
    onHeadingChanged?: (event: Map3DCameraChangedEvent) => void;
    /** Called when the tilt property changes. */
    onTiltChanged?: (event: Map3DCameraChangedEvent) => void;
    /** Called when the range property changes. */
    onRangeChanged?: (event: Map3DCameraChangedEvent) => void;
    /** Called when the roll property changes. */
    onRollChanged?: (event: Map3DCameraChangedEvent) => void;
    /** Called when any camera property changes (aggregated). */
    onCameraChanged?: (event: Map3DCameraChangedEvent) => void;
    /** Called when the map is clicked. */
    onClick?: (event: Map3DClickEvent) => void;
    /** Called when the map's steady state changes. */
    onSteadyChange?: (event: Map3DSteadyChangeEvent) => void;
    /** Called when a fly animation ends. */
    onAnimationEnd?: (event: Map3DEvent) => void;
    /** Called when a map error occurs. */
    onError?: (event: Map3DEvent) => void;
}

/**
 * MapMode for specifying how the 3D map should be rendered.
 * This mirrors google.maps.maps3d.MapMode but is available without waiting for the API to load.
 */
declare const MapMode: {
    /** This map mode displays a transparent layer of major streets on satellite imagery. */
    readonly HYBRID: "HYBRID";
    /** This map mode displays satellite or photorealistic imagery. */
    readonly SATELLITE: "SATELLITE";
};
type MapMode = (typeof MapMode)[keyof typeof MapMode];
/**
 * GestureHandling for specifying how gesture events should be handled on the map.
 * This mirrors google.maps.maps3d.GestureHandling but is available without waiting for the API to load.
 */
declare const GestureHandling: {
    /**
     * This lets the map choose whether to use cooperative or greedy gesture handling.
     * This is the default behavior if not specified.
     */
    readonly AUTO: "AUTO";
    /**
     * This forces cooperative mode, where modifier keys or two-finger gestures
     * are required to scroll the map.
     */
    readonly COOPERATIVE: "COOPERATIVE";
    /**
     * This forces greedy mode, where the host page cannot be scrolled from user
     * events on the map element.
     */
    readonly GREEDY: "GREEDY";
};
type GestureHandling = (typeof GestureHandling)[keyof typeof GestureHandling];
/**
 * Context value for Map3D, providing access to the Map3DElement instance.
 */
interface GoogleMaps3DContextValue {
    map3d: google.maps.maps3d.Map3DElement | null;
}
/**
 * React context for accessing the Map3D instance from child components.
 */
declare const GoogleMaps3DContext: React.Context<GoogleMaps3DContextValue | null>;
/**
 * Ref handle exposed by Map3D for imperative actions.
 */
interface Map3DRef {
    /** The underlying Map3DElement instance. */
    map3d: google.maps.maps3d.Map3DElement | null;
    /** Fly the camera around a center point. */
    flyCameraAround: (options: google.maps.maps3d.FlyAroundAnimationOptions) => void;
    /** Fly the camera to a destination. */
    flyCameraTo: (options: google.maps.maps3d.FlyToAnimationOptions) => void;
    /** Stop any ongoing camera animation. */
    stopCameraAnimation: () => void;
}
/**
 * Props for the Map3D component.
 */
type Map3DProps = PropsWithChildren<Omit<google.maps.maps3d.Map3DElementOptions, 'center' | 'mode' | 'gestureHandling'> & Map3DEventProps & {
    /**
     * An id for the map, this is required when multiple maps are present
     * in the same APIProvider context.
     */
    id?: string;
    /**
     * Additional style rules to apply to the map container element.
     */
    style?: CSSProperties;
    /**
     * Additional CSS class name to apply to the map container element.
     */
    className?: string;
    /**
     * The center of the map. Can be a LatLngAltitude or LatLngAltitudeLiteral.
     */
    center?: google.maps.LatLngAltitude | google.maps.LatLngAltitudeLiteral;
    /**
     * Specifies a mode the map should be rendered in.
     * Import MapMode from '@vis.gl/react-google-maps' to use this.
     */
    mode: MapMode;
    /**
     * Specifies how gesture events should be handled on the map.
     * Import GestureHandling from '@vis.gl/react-google-maps' to use this.
     */
    gestureHandling?: GestureHandling;
    defaultCenter?: google.maps.LatLngAltitudeLiteral;
    defaultHeading?: number;
    defaultTilt?: number;
    defaultRange?: number;
    defaultRoll?: number;
}>;
/**
 * A React component that renders a 3D map using the Google Maps JavaScript API.
 *
 * @example
 * ```tsx
 * <APIProvider apiKey={API_KEY}>
 *   <Map3D
 *     defaultCenter={{ lat: 37.7749, lng: -122.4194, altitude: 1000 }}
 *     defaultRange={5000}
 *     defaultHeading={0}
 *     defaultTilt={45}
 *   />
 * </APIProvider>
 * ```
 */
declare const Map3D: React.ForwardRefExoticComponent<Omit<google.maps.maps3d.Map3DElementOptions, "center" | "gestureHandling" | "mode"> & Map3DEventProps & {
    /**
     * An id for the map, this is required when multiple maps are present
     * in the same APIProvider context.
     */
    id?: string;
    /**
     * Additional style rules to apply to the map container element.
     */
    style?: CSSProperties;
    /**
     * Additional CSS class name to apply to the map container element.
     */
    className?: string;
    /**
     * The center of the map. Can be a LatLngAltitude or LatLngAltitudeLiteral.
     */
    center?: google.maps.LatLngAltitude | google.maps.LatLngAltitudeLiteral;
    /**
     * Specifies a mode the map should be rendered in.
     * Import MapMode from '@vis.gl/react-google-maps' to use this.
     */
    mode: MapMode;
    /**
     * Specifies how gesture events should be handled on the map.
     * Import GestureHandling from '@vis.gl/react-google-maps' to use this.
     */
    gestureHandling?: GestureHandling;
    defaultCenter?: google.maps.LatLngAltitudeLiteral;
    defaultHeading?: number;
    defaultTilt?: number;
    defaultRange?: number;
    defaultRoll?: number;
} & {
    children?: React.ReactNode | undefined;
} & React.RefAttributes<Map3DRef>>;

/**
 * Context for Marker3D component, providing access to the marker element.
 */
interface Marker3DContextValue {
    marker: google.maps.maps3d.Marker3DElement | google.maps.maps3d.Marker3DInteractiveElement | null;
    /** Set to true by child components (like Pin) that handle their own content */
    setContentHandledExternally: (handled: boolean) => void;
}
declare const Marker3DContext: React.Context<Marker3DContextValue | null>;
/**
 * Hook to access the Marker3D context.
 */
declare function useMarker3D(): Marker3DContextValue | null;
/**
 * AltitudeMode for specifying how altitude is interpreted for 3D elements.
 * This mirrors google.maps.maps3d.AltitudeMode but is available without waiting for the API to load.
 */
declare const AltitudeMode: {
    /** Allows to express objects relative to the average mean sea level. */
    readonly ABSOLUTE: "ABSOLUTE";
    /** Allows to express objects placed on the ground. */
    readonly CLAMP_TO_GROUND: "CLAMP_TO_GROUND";
    /** Allows to express objects relative to the ground surface. */
    readonly RELATIVE_TO_GROUND: "RELATIVE_TO_GROUND";
    /** Allows to express objects relative to the highest of ground+building+water surface. */
    readonly RELATIVE_TO_MESH: "RELATIVE_TO_MESH";
};
type AltitudeMode = (typeof AltitudeMode)[keyof typeof AltitudeMode];
/**
 * Event props for Marker3D component.
 */
type Marker3DEventProps = {
    /** Click handler. When provided, the interactive variant (Marker3DInteractiveElement) is used. */
    onClick?: (e: Event) => void;
};
/**
 * Props for the Marker3D component.
 */
type Marker3DProps = PropsWithChildren<Omit<google.maps.maps3d.Marker3DElementOptions, 'collisionBehavior' | 'altitudeMode'> & Marker3DEventProps & {
    /**
     * Specifies how the altitude component of the position is interpreted.
     * @default AltitudeMode.CLAMP_TO_GROUND
     */
    altitudeMode?: AltitudeMode;
    /**
     * An enumeration specifying how a Marker3DElement should behave when it
     * collides with another Marker3DElement or with the basemap labels.
     * @default CollisionBehavior.REQUIRED
     */
    collisionBehavior?: CollisionBehavior;
    /**
     * Rollover text (only used when onClick is provided).
     */
    title?: string;
}>;
/**
 * Marker3D component for displaying markers on a Map3D.
 *
 * Automatically uses Marker3DInteractiveElement when onClick is provided,
 * otherwise uses Marker3DElement.
 *
 * Children can include:
 * - `<img>` elements (automatically wrapped in <template>)
 * - `<svg>` elements (automatically wrapped in <template>)
 * - PinElement instances (passed through directly)
 *
 * @example
 * ```tsx
 * // Basic marker
 * <Marker3D position={{ lat: 37.7749, lng: -122.4194 }} label="SF" />
 *
 * // Interactive marker
 * <Marker3D
 *   position={{ lat: 37.7749, lng: -122.4194 }}
 *   onClick={() => console.log('clicked')}
 *   title="Click me"
 * />
 *
 * // Custom marker with image
 * <Marker3D position={{ lat: 37.7749, lng: -122.4194 }}>
 *   <img src="/icon.png" width={32} height={32} />
 * </Marker3D>
 * ```
 */
declare const Marker3D: React.ForwardRefExoticComponent<Omit<google.maps.maps3d.Marker3DElementOptions, "collisionBehavior" | "altitudeMode"> & Marker3DEventProps & {
    /**
     * Specifies how the altitude component of the position is interpreted.
     * @default AltitudeMode.CLAMP_TO_GROUND
     */
    altitudeMode?: AltitudeMode;
    /**
     * An enumeration specifying how a Marker3DElement should behave when it
     * collides with another Marker3DElement or with the basemap labels.
     * @default CollisionBehavior.REQUIRED
     */
    collisionBehavior?: CollisionBehavior;
    /**
     * Rollover text (only used when onClick is provided).
     */
    title?: string;
} & {
    children?: React.ReactNode | undefined;
} & React.RefAttributes<google.maps.maps3d.Marker3DElement | google.maps.maps3d.Marker3DInteractiveElement>>;

/**
 * Event props for Popover component.
 */
type PopoverEventProps = {
    /** Called when the popover is closed via light dismiss (click outside). */
    onClose?: () => void;
    /**
     * Content to render in the header slot of the popover.
     */
    headerContent?: ReactNode;
};
/**
 * Props for the Popover component.
 */
type PopoverProps = PropsWithChildren<Omit<google.maps.maps3d.PopoverElementOptions, 'altitudeMode' | 'positionAnchor'> & PopoverEventProps & {
    /**
     * Specifies how the altitude component of the position is interpreted.
     * @default AltitudeMode.CLAMP_TO_GROUND
     */
    altitudeMode?: AltitudeMode;
    /**
     * The position at which to display this popover.
     * Can be a LatLng position or LatLngAltitude position.
     */
    position?: google.maps.LatLngLiteral | google.maps.LatLngAltitudeLiteral;
    /**
     * A Marker3DInteractiveElement to anchor the popover to.
     * When specified, the popover will be positioned relative to the marker.
     */
    anchor?: google.maps.maps3d.Marker3DInteractiveElement | null;
    /**
     * A string ID referencing a Marker3DInteractiveElement to anchor the popover to.
     */
    anchorId?: string;
    style?: CSSProperties;
    className?: string;
}>;
/**
 * Popover component for displaying info windows on a Map3D.
 *
 * Similar to InfoWindow for 2D maps, Popover provides a way to show
 * contextual information at a specific location or attached to a marker
 * on a 3D map.
 *
 * @example
 * ```tsx
 * // Basic popover at position
 * <Popover
 *   position={{ lat: 37.7749, lng: -122.4194 }}
 *   open={isOpen}
 * >
 *   <div>Hello from San Francisco!</div>
 * </Popover>
 *
 * // Popover anchored to a marker (place as sibling, use anchor prop)
 * <Marker3D
 *   ref={markerRef}
 *   position={{ lat: 37.7749, lng: -122.4194 }}
 *   onClick={() => setOpen(true)}
 * />
 * <Popover
 *   anchor={markerRef.current}
 *   open={isOpen}
 *   onClose={() => setOpen(false)}
 * >
 *   <div>Marker info</div>
 * </Popover>
 * ```
 */
declare const Popover: React.ForwardRefExoticComponent<Omit<google.maps.maps3d.PopoverElementOptions, "altitudeMode" | "positionAnchor"> & PopoverEventProps & {
    /**
     * Specifies how the altitude component of the position is interpreted.
     * @default AltitudeMode.CLAMP_TO_GROUND
     */
    altitudeMode?: AltitudeMode;
    /**
     * The position at which to display this popover.
     * Can be a LatLng position or LatLngAltitude position.
     */
    position?: google.maps.LatLngLiteral | google.maps.LatLngAltitudeLiteral;
    /**
     * A Marker3DInteractiveElement to anchor the popover to.
     * When specified, the popover will be positioned relative to the marker.
     */
    anchor?: google.maps.maps3d.Marker3DInteractiveElement | null;
    /**
     * A string ID referencing a Marker3DInteractiveElement to anchor the popover to.
     */
    anchorId?: string;
    style?: CSSProperties;
    className?: string;
} & {
    children?: ReactNode | undefined;
} & React.RefAttributes<google.maps.maps3d.PopoverElement>>;

type StaticMapsLocation = google.maps.LatLngLiteral | string;
type StaticMapsMarker = {
    location: StaticMapsLocation;
    color?: string;
    size?: 'tiny' | 'mid' | 'small';
    label?: string;
    icon?: string;
    anchor?: string;
    scale?: 1 | 2 | 4;
};
type StaticMapsPath = {
    coordinates: Array<StaticMapsLocation> | string;
    weight?: number;
    color?: string;
    fillcolor?: string;
    geodesic?: boolean;
};
type StaticMapsApiOptions = {
    apiKey: string;
    width: number;
    height: number;
    center?: StaticMapsLocation;
    zoom?: number;
    scale?: number;
    format?: 'png' | 'png8' | 'png32' | 'gif' | 'jpg' | 'jpg-baseline';
    mapType?: google.maps.MapTypeId;
    language?: string;
    region?: string;
    mapId?: string;
    markers?: Array<StaticMapsMarker>;
    paths?: Array<StaticMapsPath>;
    visible?: Array<StaticMapsLocation>;
    style?: google.maps.MapTypeStyle[];
};

/**
 * Creates a URL for the Google Static Maps API with the specified parameters.
 *
 * @param {Object} options - The configuration options for the static map
 * @param {string} options.apiKey - Your Google Maps API key (required)
 * @param {number} options.width - The width of the map image in pixels (required)
 * @param {number} options.height - The height of the map image in pixels (required)
 * @param {StaticMapsLocation} [options.center] - The center point of the map (lat/lng or address).
 *  Required if no markers or paths or "visible locations" are provided.
 * @param {number} [options.zoom] - The zoom level of the map. Required if no markers or paths or "visible locations" are provided.
 * @param {1|2|4} [options.scale] - The resolution of the map (1, 2, or 4)
 * @param {string} [options.format] - The image format (png, png8, png32, gif, jpg, jpg-baseline)
 * @param {string} [options.mapType] - The type of map (roadmap, satellite, terrain, hybrid)
 * @param {string} [options.language] - The language of the map labels
 * @param {string} [options.region] - The region code for the map
 * @param {string} [options.map_id] - The Cloud-based map style ID
 * @param {StaticMapsMarker[]} [options.markers=[]] - Array of markers to display on the map
 * @param {StaticMapsPath[]} [options.paths=[]] - Array of paths to display on the map
 * @param {StaticMapsLocation[]} [options.visible=[]] - Array of locations that should be visible on the map
 * @param {MapTypeStyle[]} [options.style=[]] - Array of style objects to customize the map appearance
 *
 * @returns {string} The complete Google Static Maps API URL
 *
 * @throws {Error} If API key is not provided
 * @throws {Error} If width or height is not provided
 *
 * @example
 * const url = createStaticMapsUrl({
 *   apiKey: 'YOUR_API_KEY',
 *   width: 600,
 *   height: 400,
 *   center: { lat: 40.714728, lng: -73.998672 },
 *   zoom: 12,
 *   markers: [
 *     {
 *       location: { lat: 40.714728, lng: -73.998672 },
 *       color: 'red',
 *       label: 'A'
 *     }
 *   ],
 *   paths: [
 *     {
 *       coordinates: [
 *         { lat: 40.714728, lng: -73.998672 },
 *         { lat: 40.719728, lng: -73.991672 }
 *       ],
 *       color: '0x0000ff',
 *       weight: 5
 *     }
 *   ],
 *   style: [
 *     {
 *       featureType: 'road',
 *       elementType: 'geometry',
 *       stylers: [{color: '#00ff00'}]
 *     }
 *   ]
 * });
 *
 * // Results in URL similar to:
 * // https://maps.googleapis.com/maps/api/staticmap?key=YOUR_API_KEY
 * // &size=600x400
 * // &center=40.714728,-73.998672&zoom=12
 * // &markers=color:red|label:A|40.714728,-73.998672
 * // &path=color:0x0000ff|weight:5|40.714728,-73.998672|40.719728,-73.991672
 * // &style=feature:road|element:geometry|color:0x00ff00
 */
declare function createStaticMapsUrl({ apiKey, width, height, center, zoom, scale, format, mapType, language, region, mapId, markers, paths, visible, style }: StaticMapsApiOptions): string;

/**
 * Props for the StaticMap component
 */
type StaticMapProps = {
    url: string;
    className?: string;
};
declare const StaticMap: (props: StaticMapProps) => React.JSX.Element;

type MapControlProps = PropsWithChildren<{
    position: ControlPosition;
}>;
/**
 * Copy of the `google.maps.ControlPosition` constants.
 * They have to be duplicated here since we can't wait for the maps API to load to be able to use them.
 */
declare const ControlPosition: {
    readonly TOP_LEFT: 1;
    readonly TOP_CENTER: 2;
    readonly TOP: 2;
    readonly TOP_RIGHT: 3;
    readonly LEFT_CENTER: 4;
    readonly LEFT_TOP: 5;
    readonly LEFT: 5;
    readonly LEFT_BOTTOM: 6;
    readonly RIGHT_TOP: 7;
    readonly RIGHT: 7;
    readonly RIGHT_CENTER: 8;
    readonly RIGHT_BOTTOM: 9;
    readonly BOTTOM_LEFT: 10;
    readonly BOTTOM_CENTER: 11;
    readonly BOTTOM: 11;
    readonly BOTTOM_RIGHT: 12;
    readonly CENTER: 13;
    readonly BLOCK_START_INLINE_START: 14;
    readonly BLOCK_START_INLINE_CENTER: 15;
    readonly BLOCK_START_INLINE_END: 16;
    readonly INLINE_START_BLOCK_CENTER: 17;
    readonly INLINE_START_BLOCK_START: 18;
    readonly INLINE_START_BLOCK_END: 19;
    readonly INLINE_END_BLOCK_START: 20;
    readonly INLINE_END_BLOCK_CENTER: 21;
    readonly INLINE_END_BLOCK_END: 22;
    readonly BLOCK_END_INLINE_START: 23;
    readonly BLOCK_END_INLINE_CENTER: 24;
    readonly BLOCK_END_INLINE_END: 25;
};
type ControlPosition = (typeof ControlPosition)[keyof typeof ControlPosition];
declare const MapControl: FunctionComponent<MapControlProps>;

type MarkerEventProps = {
    onClick?: (e: google.maps.MapMouseEvent) => void;
    onDrag?: (e: google.maps.MapMouseEvent) => void;
    onDragStart?: (e: google.maps.MapMouseEvent) => void;
    onDragEnd?: (e: google.maps.MapMouseEvent) => void;
    onMouseOver?: (e: google.maps.MapMouseEvent) => void;
    onMouseOut?: (e: google.maps.MapMouseEvent) => void;
};
type MarkerProps = Omit<google.maps.MarkerOptions, 'map'> & MarkerEventProps;
type MarkerRef = Ref<google.maps.Marker | null>;
/**
 * Component to render a marker on a map
 */
declare const Marker: React.ForwardRefExoticComponent<Omit<google.maps.MarkerOptions, "map"> & MarkerEventProps & React.RefAttributes<google.maps.Marker>>;
declare function useMarkerRef(): readonly [(m: google.maps.Marker | null) => void, google.maps.Marker | null];

/**
 * Props for the Pin component
 */
type PinProps = PropsWithChildren<google.maps.marker.PinElementOptions>;
/**
 * Component to configure the appearance of an AdvancedMarker or Marker3D.
 *
 * Automatically detects the Maps API version and uses the appropriate implementation:
 * - Legacy implementation (< 3.62): Uses the original PinElement API with glyph property
 * - Modern implementation (≥ 3.62): Uses the new custom element API with glyphSrc/glyphText
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AdvancedMarker position={{lat: 0, lng: 0}}>
 *   <Pin background="#FF0000" glyphColor="#FFFFFF" />
 * </AdvancedMarker>
 *
 * // With custom glyph (legacy)
 * <Pin glyph="📍" />
 *
 * // With custom glyph (modern, recommended for Maps API 3.62+)
 * <Pin glyphText="📍" />
 * <Pin glyphSrc="https://example.com/icon.png" />
 *
 * // With React children as glyph
 * <Pin>
 *   <CustomIcon />
 * </Pin>
 * ```
 */
declare const Pin: FunctionComponent<PinProps>;

type RectangleEventProps = {
    onClick?: (e: google.maps.MapMouseEvent) => void;
    onDrag?: (e: google.maps.MapMouseEvent) => void;
    onDragStart?: (e: google.maps.MapMouseEvent) => void;
    onDragEnd?: (e: google.maps.MapMouseEvent) => void;
    onMouseOver?: (e: google.maps.MapMouseEvent) => void;
    onMouseOut?: (e: google.maps.MapMouseEvent) => void;
    onBoundsChanged?: (bounds: google.maps.LatLngBounds | null | undefined) => void;
};
type RectangleProps = Omit<google.maps.RectangleOptions, 'map' | 'bounds'> & RectangleEventProps & {
    /** Controlled bounds */
    bounds?: google.maps.LatLngBoundsLiteral | google.maps.LatLngBounds;
    /** Uncontrolled initial bounds */
    defaultBounds?: google.maps.LatLngBoundsLiteral | google.maps.LatLngBounds;
};
type RectangleRef = Ref<google.maps.Rectangle | null>;
declare const Rectangle: React.ForwardRefExoticComponent<Omit<google.maps.RectangleOptions, "map" | "bounds"> & RectangleEventProps & {
    /** Controlled bounds */
    bounds?: google.maps.LatLngBoundsLiteral | google.maps.LatLngBounds;
    /** Uncontrolled initial bounds */
    defaultBounds?: google.maps.LatLngBoundsLiteral | google.maps.LatLngBounds;
} & React.RefAttributes<google.maps.Rectangle>>;

declare function useApiLoadingStatus(): APILoadingStatus;

/**
 * Hook to check if the Maps JavaScript API is loaded
 */
declare function useApiIsLoaded(): boolean;

interface ApiLibraries {
    core: google.maps.CoreLibrary;
    maps: google.maps.MapsLibrary;
    places: google.maps.PlacesLibrary;
    geocoding: google.maps.GeocodingLibrary;
    routes: google.maps.RoutesLibrary;
    marker: google.maps.MarkerLibrary;
    geometry: google.maps.GeometryLibrary;
    elevation: google.maps.ElevationLibrary;
    streetView: google.maps.StreetViewLibrary;
    journeySharing: google.maps.JourneySharingLibrary;
    drawing: google.maps.DrawingLibrary;
    visualization: google.maps.VisualizationLibrary;
    maps3d: google.maps.Maps3DLibrary;
}
declare function useMapsLibrary<K extends keyof ApiLibraries, V extends ApiLibraries[K]>(name: K): V | null;

/**
 * Retrieves a map-instance from the context. This is either an instance
 * identified by id or the parent map instance if no id is specified.
 * Returns null if neither can be found.
 */
declare const useMap: (id?: string | null) => google.maps.Map | null;

/**
 * Hook to retrieve a Map3DElement instance from context.
 *
 * When called without an id, it returns the map from the nearest parent Map3D
 * component. When called with an id, it retrieves the map with that id from
 * the APIProvider context.
 *
 * @param id - Optional id of the map to retrieve. If not specified, returns
 *   the parent map instance or the default map instance.
 *
 * @example
 * ```tsx
 * // Get the parent Map3D instance
 * function MyComponent() {
 *   const map3d = useMap3D();
 *   // ...
 * }
 *
 * // Get a specific Map3D instance by id
 * function ControlPanel() {
 *   const mainMap = useMap3D('main-map');
 *   const miniMap = useMap3D('mini-map');
 *   // ...
 * }
 * ```
 */
declare function useMap3D(id?: string | null): google.maps.maps3d.Map3DElement | null;

declare function isLatLngLiteral(obj: unknown): obj is google.maps.LatLngLiteral;
declare function latLngEquals(a: google.maps.LatLngLiteral | google.maps.LatLng | undefined | null, b: google.maps.LatLngLiteral | google.maps.LatLng | undefined | null): boolean;
declare function toLatLngLiteral(obj: google.maps.LatLngLiteral | google.maps.LatLng): google.maps.LatLngLiteral;
declare function toLatLngBoundsLiteral(obj: google.maps.LatLngBoundsLiteral | google.maps.LatLngBounds): google.maps.LatLngBoundsLiteral;
declare function boundsEquals(a: google.maps.LatLngBoundsLiteral | google.maps.LatLngBounds | undefined | null, b: google.maps.LatLngBoundsLiteral | google.maps.LatLngBounds | undefined | null): boolean;
type LatLngInput = google.maps.LatLngLiteral | google.maps.LatLng;
/**
 * Compares two paths (arrays of LatLng points) for equality.
 */
declare function pathEquals(a: LatLngInput[] | null | undefined, b: google.maps.MVCArray<google.maps.LatLng> | LatLngInput[] | null | undefined): boolean;
/**
 * Compares two arrays of paths (for Polygon) for equality.
 */
declare function pathsEquals(a: LatLngInput[][] | null | undefined, b: google.maps.MVCArray<google.maps.MVCArray<google.maps.LatLng>> | LatLngInput[][] | null | undefined): boolean;

/**
 * Function to limit the tilt range of the Google map when updating the view state
 */
declare const limitTiltRange: ({ viewState }: any) => any;

export { APILoadingStatus, APIProvider, APIProviderContext, AdvancedMarker, AdvancedMarkerAnchorPoint, AdvancedMarkerContext, AltitudeMode, Circle, CollisionBehavior, ColorScheme, ControlPosition, GestureHandling, GoogleMaps3DContext, GoogleMapsContext, InfoWindow, Map, Map3D, MapControl, MapMode, Marker, Marker3D, Marker3DContext, Pin, Polygon, Polyline, Popover, Rectangle, RenderingType, StaticMap, VERSION, __resetModuleState, boundsEquals, createStaticMapsUrl, isAdvancedMarker, isLatLngLiteral, latLngEquals, limitTiltRange, pathEquals, pathsEquals, toLatLngBoundsLiteral, toLatLngLiteral, useAdvancedMarkerRef, useApiIsLoaded, useApiLoadingStatus, useMap, useMap3D, useMapsLibrary, useMarker3D, useMarkerRef };
export type { APIProviderContextValue, APIProviderProps, AdvancedMarkerContextValue, AdvancedMarkerProps, AdvancedMarkerRef, CircleProps, CircleRef, CustomMarkerContent, GoogleMaps3DContextValue, GoogleMapsContextValue, InfoWindowProps, Map3DCameraChangedEvent, Map3DClickEvent, Map3DElementProps, Map3DEvent, Map3DEventProps, Map3DProps, Map3DRef, Map3DSteadyChangeEvent, MapCameraChangedEvent, MapCameraProps, MapEvent, MapEventProps, MapMouseEvent, MapProps, Marker3DContextValue, Marker3DElementProps, Marker3DProps, MarkerProps, MarkerRef, Model3DProps, NoAttributes, NoChildren, PinProps, Polygon3DProps, PolygonProps, PolygonRef, Polyline3DProps, PolylineProps, PolylineRef, PopoverElementProps, PopoverProps, RectangleProps, RectangleRef, StaticMapProps, StaticMapsApiOptions, StaticMapsLocation, StaticMapsMarker, StaticMapsPath };
