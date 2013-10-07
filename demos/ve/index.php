<?php
/**
 * VisualEditor standalone demo
 *
 * @file
 * @ingroup Extensions
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

$path = __DIR__ . '/pages';
$pages = glob( $path . '/*.html' );
$page = current( $pages );
if ( isset( $_GET['page'] ) && in_array( $path . '/' . $_GET['page'] . '.html', $pages ) ) {
	$page = $path . '/' . $_GET['page'] . '.html';
}
$html = file_get_contents( $page );

?>
<!DOCTYPE html>

<html>
	<head>
		<meta charset="UTF-8">
		<title>VisualEditor Standalone Demo</title>

		<!-- Generated by maintenance/makeStaticLoader.php -->
		<!-- ext.visualEditor.base#standalone-init -->
		<link rel=stylesheet href="../../modules/ve/init/sa/styles/ve.init.sa.css">
		<script>
			if (
				document.createElementNS &&
				document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' ).createSVGRect
			) {
				document.write(
					'<link rel="stylesheet" ' +
						'href="../../modules/ve/ui/styles/ve.ui.Icons-vector.css">'
				);
			} else {
				document.write(
					'<link rel="stylesheet" ' +
						'href="../../modules/ve/ui/styles/ve.ui.Icons-raster.css">'
				);
			}
		</script>
		<!-- ext.visualEditor.core -->
		<link rel=stylesheet href="../../modules/ve/ce/styles/ve.ce.Node.css">
		<link rel=stylesheet href="../../modules/ve/ce/styles/ve.ce.Surface.css">
		<link rel=stylesheet href="../../modules/ve/ui/styles/ve.ui.css">
		<link rel=stylesheet href="../../modules/ve/ui/styles/ve.ui.Surface.css">
		<link rel=stylesheet href="../../modules/ve/ui/styles/ve.ui.Context.css">
		<link rel=stylesheet href="../../modules/ve/ui/styles/ve.ui.Frame.css">
		<link rel=stylesheet href="../../modules/ve/ui/styles/ve.ui.Window.css">
		<link rel=stylesheet href="../../modules/ve/ui/styles/ve.ui.Toolbar.css">
		<link rel=stylesheet href="../../modules/ve/ui/styles/ve.ui.ToolGroup.css">
		<link rel=stylesheet href="../../modules/ve/ui/styles/ve.ui.Tool.css">
		<link rel=stylesheet href="../../modules/ve/ui/styles/ve.ui.Element.css">
		<link rel=stylesheet href="../../modules/ve/ui/styles/ve.ui.Layout.css">
		<link rel=stylesheet href="../../modules/ve/ui/styles/ve.ui.Widget.css">
		<link rel=stylesheet href="../../modules/ve/ui/styles/ve.ui.Inspector.css">
		<link rel=stylesheet href="../../modules/ve/ui/styles/ve.ui.Dialog.css">
		<!-- jquery.uls.grid -->
		<link rel=stylesheet href="../../modules/jquery.uls/css/jquery.uls.grid.css">
		<!-- jquery.uls.compact -->
		<link rel=stylesheet href="../../modules/jquery.uls/css/jquery.uls.compact.css">
		<!-- jquery.uls -->
		<link rel=stylesheet href="../../modules/jquery.uls/css/jquery.uls.css">
		<link rel=stylesheet href="../../modules/jquery.uls/css/jquery.uls.lcd.css">

		<!-- demo -->
		<link rel="stylesheet" href="demo.css">
	</head>
	<body>
		<ul class="ve-demo-docs">
			<?php
				foreach ( $pages as $page ): ?>
				<li>
					<a href="./?page=<?php echo basename( $page, '.html' ); ?>">
						<?php echo basename( $page, '.html' ); ?>
					</a>
				</li>
			<?php
				endforeach; ?>
		</ul>
		<div class="ve-demo-editor"></div>

		<!-- Generated by maintenance/makeStaticLoader.php -->
		<!-- Dependencies -->
		<script src="../../modules/jquery/jquery.js"></script>
		<script src="../../modules/jquery/jquery.client.js"></script>
		<script src="../../modules/oojs/oo.js"></script>
		<script src="../../modules/rangy/rangy-core-1.3.js"></script>
		<script src="../../modules/rangy/rangy-position-1.3.js"></script>
		<script src="../../modules/unicodejs/unicodejs.js"></script>
		<script src="../../modules/unicodejs/unicodejs.textstring.js"></script>
		<script src="../../modules/unicodejs/unicodejs.graphemebreakproperties.js"></script>
		<script src="../../modules/unicodejs/unicodejs.graphemebreak.js"></script>
		<script src="../../modules/unicodejs/unicodejs.wordbreakproperties.js"></script>
		<script src="../../modules/unicodejs/unicodejs.wordbreak.js"></script>
		<!-- ext.visualEditor.base#standalone-init -->
		<script src="../../modules/ve/ve.js"></script>
		<script src="../../modules/ve/ve.track.js"></script>
		<script src="../../modules/ve/ve.EventEmitter.js"></script>
		<script src="../../modules/ve/init/ve.init.js"></script>
		<script src="../../modules/ve/init/ve.init.Platform.js"></script>
		<script src="../../modules/ve/init/ve.init.Target.js"></script>
		<script src="../../modules/ve/init/sa/ve.init.sa.js"></script>
		<script src="../../modules/ve/init/sa/ve.init.sa.Platform.js"></script>
		<script src="../../modules/ve/init/sa/ve.init.sa.Target.js"></script>
		<script src="../../modules/ve/ve.debug.js"></script>
		<script>
			<?php
				require '../../modules/../VisualEditor.i18n.php';
				echo 've.init.platform.addMessages( ' . json_encode( $messages['en'] ) . " );\n";
			?>
			ve.init.platform.setModulesUrl( '../../modules' );
		</script>
		<!-- ext.visualEditor.core -->
		<script src="../../modules/ve/ve.Registry.js"></script>
		<script src="../../modules/ve/ve.Factory.js"></script>
		<script src="../../modules/ve/ve.Range.js"></script>
		<script src="../../modules/ve/ve.Node.js"></script>
		<script src="../../modules/ve/ve.BranchNode.js"></script>
		<script src="../../modules/ve/ve.LeafNode.js"></script>
		<script src="../../modules/ve/ve.Element.js"></script>
		<script src="../../modules/ve/ve.Document.js"></script>
		<script src="../../modules/ve/ve.EventSequencer.js"></script>
		<script src="../../modules/ve/dm/ve.dm.js"></script>
		<script src="../../modules/ve/dm/ve.dm.Model.js"></script>
		<script src="../../modules/ve/dm/ve.dm.ModelRegistry.js"></script>
		<script src="../../modules/ve/dm/ve.dm.NodeFactory.js"></script>
		<script src="../../modules/ve/dm/ve.dm.AnnotationFactory.js"></script>
		<script src="../../modules/ve/dm/ve.dm.AnnotationSet.js"></script>
		<script src="../../modules/ve/dm/ve.dm.MetaItemFactory.js"></script>
		<script src="../../modules/ve/dm/ve.dm.Node.js"></script>
		<script src="../../modules/ve/dm/ve.dm.BranchNode.js"></script>
		<script src="../../modules/ve/dm/ve.dm.LeafNode.js"></script>
		<script src="../../modules/ve/dm/ve.dm.Annotation.js"></script>
		<script src="../../modules/ve/dm/ve.dm.InternalList.js"></script>
		<script src="../../modules/ve/dm/ve.dm.MetaItem.js"></script>
		<script src="../../modules/ve/dm/ve.dm.MetaList.js"></script>
		<script src="../../modules/ve/dm/ve.dm.TransactionProcessor.js"></script>
		<script src="../../modules/ve/dm/ve.dm.Transaction.js"></script>
		<script src="../../modules/ve/dm/ve.dm.Surface.js"></script>
		<script src="../../modules/ve/dm/ve.dm.SurfaceFragment.js"></script>
		<script src="../../modules/ve/dm/ve.dm.DataString.js"></script>
		<script src="../../modules/ve/dm/ve.dm.Document.js"></script>
		<script src="../../modules/ve/dm/ve.dm.LinearData.js"></script>
		<script src="../../modules/ve/dm/ve.dm.DocumentSynchronizer.js"></script>
		<script src="../../modules/ve/dm/ve.dm.IndexValueStore.js"></script>
		<script src="../../modules/ve/dm/ve.dm.Converter.js"></script>
		<script src="../../modules/ve/dm/lineardata/ve.dm.SlicedLinearData.js"></script>
		<script src="../../modules/ve/dm/lineardata/ve.dm.FlatLinearData.js"></script>
		<script src="../../modules/ve/dm/lineardata/ve.dm.ElementLinearData.js"></script>
		<script src="../../modules/ve/dm/lineardata/ve.dm.MetaLinearData.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.GeneratedContentNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.AlienNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.BreakNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.CenterNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.DefinitionListItemNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.DefinitionListNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.DivNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.DocumentNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.HeadingNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.ImageNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.InternalItemNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.InternalListNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.ListItemNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.ListNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.ParagraphNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.PreformattedNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.TableCaptionNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.TableCellNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.TableNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.TableRowNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.TableSectionNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.TextNode.js"></script>
		<script src="../../modules/ve/dm/annotations/ve.dm.LinkAnnotation.js"></script>
		<script src="../../modules/ve/dm/annotations/ve.dm.TextStyleAnnotation.js"></script>
		<script src="../../modules/ve/dm/metaitems/ve.dm.AlienMetaItem.js"></script>
		<script src="../../modules/ve/ce/ve.ce.js"></script>
		<script src="../../modules/ve/ce/ve.ce.DomRange.js"></script>
		<script src="../../modules/ve/ce/ve.ce.AnnotationFactory.js"></script>
		<script src="../../modules/ve/ce/ve.ce.NodeFactory.js"></script>
		<script src="../../modules/ve/ce/ve.ce.Document.js"></script>
		<script src="../../modules/ve/ce/ve.ce.View.js"></script>
		<script src="../../modules/ve/ce/ve.ce.Annotation.js"></script>
		<script src="../../modules/ve/ce/ve.ce.Node.js"></script>
		<script src="../../modules/ve/ce/ve.ce.BranchNode.js"></script>
		<script src="../../modules/ve/ce/ve.ce.ContentBranchNode.js"></script>
		<script src="../../modules/ve/ce/ve.ce.LeafNode.js"></script>
		<script src="../../modules/ve/ce/ve.ce.ProtectedNode.js"></script>
		<script src="../../modules/ve/ce/ve.ce.FocusableNode.js"></script>
		<script src="../../modules/ve/ce/ve.ce.RelocatableNode.js"></script>
		<script src="../../modules/ve/ce/ve.ce.ResizableNode.js"></script>
		<script src="../../modules/ve/ce/ve.ce.Surface.js"></script>
		<script src="../../modules/ve/ce/ve.ce.SurfaceObserver.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.GeneratedContentNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.AlienNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.BreakNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.CenterNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.DefinitionListItemNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.DefinitionListNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.DivNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.DocumentNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.HeadingNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.ImageNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.InternalItemNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.InternalListNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.ListItemNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.ListNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.ParagraphNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.PreformattedNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.TableCaptionNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.TableCellNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.TableNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.TableRowNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.TableSectionNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.TextNode.js"></script>
		<script src="../../modules/ve/ce/annotations/ve.ce.LinkAnnotation.js"></script>
		<script src="../../modules/ve/ce/annotations/ve.ce.TextStyleAnnotation.js"></script>
		<script src="../../modules/ve/ui/ve.ui.js"></script>
		<script src="../../modules/ve/ui/elements/ve.ui.ClippableElement.js"></script>
		<script src="../../modules/ve/ui/elements/ve.ui.LabeledElement.js"></script>
		<script src="../../modules/ve/ui/elements/ve.ui.IconedElement.js"></script>
		<script src="../../modules/ve/ui/elements/ve.ui.GroupElement.js"></script>
		<script src="../../modules/ve/ui/elements/ve.ui.FlaggableElement.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Surface.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Context.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Frame.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Window.js"></script>
		<script src="../../modules/ve/ui/ve.ui.WindowSet.js"></script>
		<script src="../../modules/ve/ui/ve.ui.SurfaceWindowSet.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Inspector.js"></script>
		<script src="../../modules/ve/ui/ve.ui.SurfaceInspector.js"></script>
		<script src="../../modules/ve/ui/ve.ui.InspectorFactory.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Dialog.js"></script>
		<script src="../../modules/ve/ui/ve.ui.SurfaceDialog.js"></script>
		<script src="../../modules/ve/ui/ve.ui.DialogFactory.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Layout.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Widget.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Tool.js"></script>
		<script src="../../modules/ve/ui/ve.ui.ToolGroup.js"></script>
		<script src="../../modules/ve/ui/ve.ui.ToolFactory.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Toolbar.js"></script>
		<script src="../../modules/ve/ui/ve.ui.SurfaceToolbar.js"></script>
		<script src="../../modules/ve/ui/ve.ui.TargetToolbar.js"></script>
		<script src="../../modules/ve/ui/ve.ui.CommandRegistry.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Trigger.js"></script>
		<script src="../../modules/ve/ui/ve.ui.TriggerRegistry.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Action.js"></script>
		<script src="../../modules/ve/ui/ve.ui.ActionFactory.js"></script>
		<script src="../../modules/ve/ui/actions/ve.ui.AnnotationAction.js"></script>
		<script src="../../modules/ve/ui/actions/ve.ui.ContentAction.js"></script>
		<script src="../../modules/ve/ui/actions/ve.ui.FormatAction.js"></script>
		<script src="../../modules/ve/ui/actions/ve.ui.HistoryAction.js"></script>
		<script src="../../modules/ve/ui/actions/ve.ui.IndentationAction.js"></script>
		<script src="../../modules/ve/ui/actions/ve.ui.InspectorAction.js"></script>
		<script src="../../modules/ve/ui/actions/ve.ui.ListAction.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.PopupWidget.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.SelectWidget.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.OptionWidget.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.SearchWidget.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.SurfaceWidget.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.ButtonWidget.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.IconButtonWidget.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.PushButtonWidget.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.PopupButtonWidget.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.InputWidget.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.InputLabelWidget.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.TextInputWidget.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.OutlineItemWidget.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.OutlineWidget.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.OutlineControlsWidget.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.MenuItemWidget.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.MenuSectionItemWidget.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.MenuWidget.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.LookupInputWidget.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.TextInputMenuWidget.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.LinkTargetInputWidget.js"></script>
		<script src="../../modules/ve/ui/layouts/ve.ui.FieldsetLayout.js"></script>
		<script src="../../modules/ve/ui/layouts/ve.ui.GridLayout.js"></script>
		<script src="../../modules/ve/ui/layouts/ve.ui.PanelLayout.js"></script>
		<script src="../../modules/ve/ui/layouts/ve.ui.StackPanelLayout.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.AnnotationTool.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.ClearAnnotationTool.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.DialogTool.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.FormatTool.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.HistoryTool.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.IndentationTool.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.InspectorTool.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.ListTool.js"></script>
		<script src="../../modules/ve/ui/toolgroups/ve.ui.BarToolGroup.js"></script>
		<script src="../../modules/ve/ui/toolgroups/ve.ui.PopupToolGroup.js"></script>
		<script src="../../modules/ve/ui/toolgroups/ve.ui.ListToolGroup.js"></script>
		<script src="../../modules/ve/ui/toolgroups/ve.ui.MenuToolGroup.js"></script>
		<script src="../../modules/ve/ui/inspectors/ve.ui.AnnotationInspector.js"></script>
		<script src="../../modules/ve/ui/inspectors/ve.ui.LinkInspector.js"></script>
		<!-- jquery.uls.data -->
		<script src="../../modules/jquery.uls/src/jquery.uls.data.js"></script>
		<script src="../../modules/jquery.uls/src/jquery.uls.data.utils.js"></script>
		<!-- jquery.uls -->
		<script src="../../modules/jquery.uls/src/jquery.uls.core.js"></script>
		<script src="../../modules/jquery.uls/src/jquery.uls.lcd.js"></script>
		<script src="../../modules/jquery.uls/src/jquery.uls.languagefilter.js"></script>
		<script src="../../modules/jquery.uls/src/jquery.uls.regionfilter.js"></script>
		<!-- ext.visualEditor.experimental -->
		<script src="../../modules/ve/dm/annotations/ve.dm.LanguageAnnotation.js"></script>
		<script src="../../modules/ve/ce/annotations/ve.ce.LanguageAnnotation.js"></script>
		<script src="../../modules/ve/ui/inspectors/ve.ui.LanguageInspector.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.LanguageInputWidget.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.ExperimentalTool.js"></script>

		<!-- demo -->
		<script>
			$( document ).ready( function () {
				new ve.init.sa.Target(
					$( '.ve-demo-editor' ),
					ve.createDocumentFromHtml( <?php echo json_encode( $html ) ?> )
				);
				$( '.ve-ce-documentNode' ).focus();
				// ve.instances[0].getDialogs().open( 'meta' );
			} );
		</script>

		<div class="ve-demo-utilities">
			<p>
				<div class="ve-demo-utilities-commands"></div>
			</p>
			<table id="ve-dump" class="ve-demo-dump">
				<thead>
					<th>Linear model</th>
					<th>View tree</th>
					<th>Model tree</th>
				</thead>
				<tbody>
					<tr>
						<td width="30%" id="ve-linear-model-dump"></td>
						<td id="ve-view-tree-dump" style="vertical-align: top;"></td>
						<td id="ve-model-tree-dump" style="vertical-align: top;"></td>
					</tr>
				</tbody>
			</table>
		</div>

		<script>
		$( function () {

			// Widgets
			var startTextInput = new ve.ui.TextInputWidget( { 'readOnly': true } ),
				endTextInput = new ve.ui.TextInputWidget( { 'readOnly': true } ),
				startTextInputLabel = new ve.ui.InputLabelWidget(
					{ 'label': 'Start', 'input': startTextInput }
				),
				endTextInputLabel = new ve.ui.InputLabelWidget(
					{ 'label': 'End', 'input': endTextInput }
				),
				getRangeButton = new ve.ui.PushButtonWidget( { 'label': 'Get selected range' } ),
				logRangeButton = new ve.ui.PushButtonWidget(
					{ 'label': 'Log to console', 'disabled': true }
				),
				dumpModelButton = new ve.ui.PushButtonWidget( { 'label': 'Dump model' } ),
				validateButton = new ve.ui.PushButtonWidget( { 'label': 'Validate view and model' } );

			// Initialization
			$( '.ve-demo-utilities-commands' ).append(
				getRangeButton.$,
				startTextInputLabel.$,
				startTextInput.$,
				endTextInputLabel.$,
				endTextInput.$,
				logRangeButton.$,
				$( '<span class="ve-demo-utilities-commands-divider">&nbsp;</span>' ),
				dumpModelButton.$,
				validateButton.$
			);

			// Events
			getRangeButton.on( 'click', function () {
				var range = ve.instances[0].view.model.getSelection();
				startTextInput.setValue( range.start );
				endTextInput.setValue( range.end );
				logRangeButton.setDisabled( false );
			} );
			logRangeButton.on( 'click', function () {
				var	start = startTextInput.getValue(),
					end = endTextInput.getValue();
				// TODO: Validate input
				console.dir( ve.instances[0].view.documentView.model.data.slice( start, end ) );
			} );
			dumpModelButton.on( 'click', function () {
				// linear model dump
				var i, $li, element, html, annotations,
					$ol = $( '<ol start="0"></ol>' );

				for ( i = 0; i < ve.instances[0].model.documentModel.data.getLength(); i++ ) {
					$li = $( '<li>' );
					$label = $( '<span>' );
					element = ve.instances[0].model.documentModel.data.getData( i );
					if ( element.type ) {
						$label.addClass( 've-demo-dump-element' );
						text = element.type;
						annotations = element.annotations;
					} else if ( ve.isArray( element ) ){
						$label.addClass( 've-demo-dump-achar' );
						text = element[0];
						annotations = element[1];
					} else {
						$label.addClass( 've-demo-dump-char' );
						text = element;
						annotations = undefined;
					}
					$label.html( ( text.match( /\S/ ) ? text : '&nbsp;' ) + ' ' );
					if ( annotations ) {
						$label.append(
							$( '<span>' ).text(
								'[' + ve.instances[0].model.documentModel.store.values( annotations ).map( function( ann ) {
									return ann.name;
								} ).join( ', ' ) + ']'
							)
						);
					}

					$li.append( $label );
					$ol.append( $li );
				}
				$( '#ve-linear-model-dump' ).html( $ol );

				// tree dump
				var getKids = function ( obj ) {
					var $ol = $( '<ol start="0"></ol>' ),
						$li;
					for ( var i = 0; i < obj.children.length; i++ ) {
						$li = $( '<li>' );
						$label = $( '<span>' ).addClass( 've-demo-dump-element' );
						if ( obj.children[i].length !== undefined ) {
							$li.append(
								$label
									.text( obj.children[i].type )
									.append(
										$( '<span>' ).text( ' (' + obj.children[i].length + ')' )
									)
							);
						} else {
							$li.append( $label.text( obj.children[i].type ) );
						}

						if ( obj.children[i].children ) {
							$li.append( getKids( obj.children[i] ) );
						}


						$ol.append( $li );
					}
					return $ol;
				}
				$( '#ve-model-tree-dump' ).html(
					getKids( ve.instances[0].model.documentModel.documentNode )
				);
				$( '#ve-view-tree-dump' ).html(
					getKids( ve.instances[0].view.documentView.documentNode )
				);
				$( '#ve-dump' ).show();
			} );
			validateButton.on( 'click', function () {
				var failed = false;
				$( '.ve-ce-branchNode' ).each( function ( index, element ) {
					var $element = $( element ),
						view = $element.data( 'view' );
					if ( view.canContainContent() ) {
						var nodeRange = view.model.getRange();
						var textModel = ve.instances[0]
							.view.model.getDocument().getText( nodeRange );
						var textDom = ve.ce.getDomText( view.$[0] );
						if ( textModel !== textDom ) {
							failed = true;
							console.log( 'Inconsistent data', {
								'textModel': textModel,
								'textDom': textDom,
								'element': element
							} );
						}
					}
				} );
				if ( failed ) {
					alert( 'Not valid - check JS console for details' );
				} else {
					alert( 'Valid' );
				}
			} );
		} );
		</script>
	</body>
</html>
