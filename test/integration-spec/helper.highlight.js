"use strict";

var test = require( "tape" );
var algoliasearchHelper = require( "../../index" );
var setup = require( "../integration-utils.js" ).setup;

test( "[INT][HIGHLIGHT] The highlight should be consistent with the parameters", function( t ) {
  var indexName = "helper_highlight";

  setup( indexName, function( client, index ) {
    return index.addObjects( [
                  { facet : [ "f1", "f2" ] },
                  { facet : [ "f1", "f3" ] },
                  { facet : [ "f2", "f3" ] }
                ] )
                .then( function() {
                  return index.setSettings( {
                    attributesToIndex : [ "facet" ],
                    attributesForFaceting : [ "facet" ]
                  } );
                } )
                .then( function( content ) {
                  return index.waitTask( content.taskID );
                } ).then( function() {
                  return client;
                } );
  } ).then( function( client ) {
    var helper = algoliasearchHelper( client, indexName, {
      attributesToHighlight : ["facet"],
      facets : [ "facet" ]
    } );

    var calls = 0;
    helper.on( "result", function( content ) {
      calls++;
      if( calls === 1 ) {
        t.equal( content.hits[0]._highlightResult.facet[0].value,
                "<em>f1</em>",
                "should be hightlighted with em (default)" );
        t.equal( content.hits[1]._highlightResult.facet[0].value,
                "<em>f1</em>",
                "should be hightlighted with em (default)" );
      }
      else if( calls === 2 ) {
        t.equal( content.hits[0]._highlightResult.facet[0].value,
                "<strong>f1</strong>",
                "should be hightlighted with strong (setting)" );
        t.equal( content.hits[1]._highlightResult.facet[0].value,
                "<strong>f1</strong>",
                "should be hightlighted with strong (setting)" );
        t.end();
      }
    } );

    helper.setQuery( "f1" )
          .search()
          .setQueryParameter( "highlightPostTag", "</strong>" )
          .setQueryParameter( "highlightPreTag", "<strong>" )
          .search();
  } );
} );
