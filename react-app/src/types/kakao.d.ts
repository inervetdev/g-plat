// Kakao Maps JavaScript API Type Definitions
// https://apis.map.kakao.com/web/documentation/

declare global {
  interface Window {
    kakao: {
      maps: {
        Map: new (container: HTMLElement, options: kakao.maps.MapOptions) => kakao.maps.Map
        LatLng: new (latitude: number, longitude: number) => kakao.maps.LatLng
        Marker: new (options: kakao.maps.MarkerOptions) => kakao.maps.Marker
        InfoWindow: new (options: kakao.maps.InfoWindowOptions) => kakao.maps.InfoWindow
        services: {
          Geocoder: new () => kakao.maps.services.Geocoder
        }
      }
    }
  }
}

declare namespace kakao.maps {
  interface MapOptions {
    center: LatLng
    level?: number // 지도 확대 레벨 (1-14)
    mapTypeId?: any
    draggable?: boolean
    scrollwheel?: boolean
    disableDoubleClick?: boolean
    disableDoubleClickZoom?: boolean
    projectionId?: string
    tileAnimation?: boolean
    keyboardShortcuts?: boolean | { [key: string]: boolean }
  }

  interface LatLng {
    getLat(): number
    getLng(): number
    equals(latlng: LatLng): boolean
    toString(): string
  }

  interface Map {
    setCenter(latlng: LatLng): void
    getCenter(): LatLng
    setLevel(level: number, options?: { animate: boolean; anchor: LatLng }): void
    getLevel(): number
    setMapTypeId(mapTypeId: any): void
    getMapTypeId(): any
    setBounds(bounds: any): void
    getBounds(): any
    setDraggable(draggable: boolean): void
    getDraggable(): boolean
    setZoomable(zoomable: boolean): void
    getZoomable(): boolean
    relayout(): void
    addOverlayMapTypeId(mapTypeId: any): void
    removeOverlayMapTypeId(mapTypeId: any): void
    setKeyboardShortcuts(active: boolean): void
    getKeyboardShortcuts(): boolean
    panBy(dx: number, dy: number): void
    panTo(latlng: LatLng): void
  }

  interface MarkerOptions {
    position: LatLng
    map?: Map
    image?: any
    title?: string
    draggable?: boolean
    clickable?: boolean
    zIndex?: number
    opacity?: number
    altitude?: number
    range?: number
  }

  interface Marker {
    setMap(map: Map | null): void
    getMap(): Map
    setPosition(position: LatLng): void
    getPosition(): LatLng
    setZIndex(zIndex: number): void
    getZIndex(): number
    setVisible(visible: boolean): void
    getVisible(): boolean
    setTitle(title: string): void
    getTitle(): string
    setDraggable(draggable: boolean): void
    getDraggable(): boolean
    setClickable(clickable: boolean): void
    getClickable(): boolean
    setAltitude(altitude: number): void
    getAltitude(): number
    setRange(range: number): void
    getRange(): number
    setOpacity(opacity: number): void
    getOpacity(): number
    setImage(image: any): void
    getImage(): any
  }

  interface InfoWindowOptions {
    content: string | HTMLElement
    disableAutoPan?: boolean
    map?: Map
    position?: LatLng
    removable?: boolean
    zIndex?: number
  }

  interface InfoWindow {
    open(map: Map, marker: Marker): void
    close(): void
    getMap(): Map
    setPosition(position: LatLng): void
    getPosition(): LatLng
    setContent(content: string | HTMLElement): void
    getContent(): string | HTMLElement
    setZIndex(zIndex: number): void
    getZIndex(): number
  }

  namespace services {
    interface Geocoder {
      addressSearch(
        address: string,
        callback: (result: any[], status: Status) => void,
        options?: {
          page?: number
          size?: number
        }
      ): void
      coord2Address(
        longitude: number,
        latitude: number,
        callback: (result: any[], status: Status) => void,
        options?: {
          input_coord?: string
        }
      ): void
    }

    enum Status {
      OK = 'OK',
      ZERO_RESULT = 'ZERO_RESULT',
      ERROR = 'ERROR'
    }
  }

  namespace event {
    function addListener(
      target: any,
      type: string,
      handler: (...args: any[]) => void
    ): void
    function removeListener(
      target: any,
      type: string,
      handler: (...args: any[]) => void
    ): void
  }
}

export {}
