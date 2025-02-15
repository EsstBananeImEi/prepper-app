export interface BingModel {
    _type: string
    instrumentation: InstrumentationModel
    readLink: string
    webSearchUrl: string
    queryContext: QueryContextModel
    totalEstimatedMatches: SVGAnimatedNumberList
    nextOffset: number
    currentOffset: number
    value: BingValueModel[]
    queryExpansions: QueryExpansionsModel[]
    pivotSuggestions: PivotSuggestionsModel[]
    relatedSearches: SuggestionModel[]
}

interface PivotSuggestionsModel {
    pivot: string
    suggestions: SuggestionModel[]
}

interface SuggestionModel {
    text: string
    displayText: string
    webSearchUrl: string
    searchLink: string
    thumbnail: ThumbnailUrlModel
}

interface QueryExpansionsModel {
    text: string
    displayText: string
    webSearchUrl: string
    searchLink: string
    thumbnail: ThumbnailUrlModel

}

interface ThumbnailUrlModel {
    thumbnailUrl: string
}

interface InstrumentationModel {
    _type: string
}

interface QueryContextModel {
    originalQuery: string
    alterationDisplayQuery: string
    alterationOverrideQuery: string
    alterationMethod: string
    alterationType: string
}

interface BingValueModel {
    webSearchUrl: string
    name: string
    thumbnailUrl: string
    datePublished: string
    isFamilyFriendly: string
    contentUrl: string
    hostPageUrl: string
    contentSize: string
    encodingFormat: string
    hostPageDisplayUrl: string
    width: number
    height: number
    hostPageDiscoveredDate: string
    thumbnail: ThumbnailModel
    imageInsightsToken: string
    insightsMetadata: InsightsMetaDataModel
    imageId: string
    accentColor: string
}

interface ThumbnailModel {
    width: number
    height: number
}

interface InsightsMetaDataModel {
    pagesIncludingCount: number
    availableSizesCount: number
}
