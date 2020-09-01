import utils from '../utils';

module.exports = function() {
	var extended = {
		name: 'peers-istanbul',
		title: 'Peer Istanbul',
		size: 'medium',

		hideLink: true,

		url: 'api/node/peers/istanbul/candidates',
		url_propose: 'api/node/peers/istanbulPropose',

		template: _.template('<table style="width: 100%; table-layout: fixed;" class="table table-striped">' +
				' <thead style="front-weight: bold;">' +
				' <tr>' +
				'	<td class="candidate">Candidate</td>' +
				'	<td class="action">Voting Action</td>' +
				'	<td class="yes-col"</td>' +
				' </tr>' +
				' </thead>' +
				'<tbody><%= rows %></tbody>' +
				'</table>'),
				
		templateRow: _.template('<tr>' +
				'	<td class="value candidate" contentEditable="false" style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;"><%= candidate %></td>'+
				'   <td class="value action"><%= auth %></td>' +
				'   <td data-candidate="<%= candidate %>" data-auth="<%= auth %>" class="yes-col">' +
				'		<button class="btn btn-default yes-btn">Agree</button>' +
				'   </td>' +
				'</tr>'),
		
		modalConfirmation: _.template('<div class="modal-body"><%=message%></div>'),

		fetch: function() {
			var _this = this;

			$.when(
				utils.load({ url: _this.url })
			).done(function(info) {
				var candidates = [];
	

				if (!_.isEmpty(info.data.attributes.result)) {
					_.each(info.data.attributes.result, function(auth, candidate) {
						console.log(candidate);
						console.log(auth)
						var action = auth ? "Add" : "Remove"
						candidates.push( _this.templateRow({ candidate: candidate, auth: action }) );
					});

					Dashboard.Utils.emit( widget.name + '|fetch|' + JSON.stringify(info.data) );

					$('#widget-' + _this.shell.id).html( _this.template({ rows: candidates.join('') }) );


					utils.makeAreaEditable('#widget-' + _this.shell.id + ' .value');
				} else {
					// no peers
					$('#widget-' + _this.shell.id).html('No Candidates');
				}
			}.bind(this));

			_this.postFetch();
		},

		postRender: function() {
			var _this = this;

         $('#widget-' + _this.shell.id).on('click', '.yes-btn', function(e) {
        	 var candidate = $(e.target.parentElement).data("candidate")
        	 var auth = $(e.target.parentElement).data("auth") == "Add" ? "true" : "false"
        	 console.log("auth")
        	 console.log(auth)
        	 $.when(
 					utils.load({
 						url: _this.url_propose,
 						data: {
 							"address": candidate,
 							"istanbulPropose": auth
 						}
 					})
 				).done(function () {
 					_this.fetch();
 				}).fail(function(err) {
 						$('#myModal .modal-content').html(_this.modalConfirmation({
 							message: err.responseJSON.errors.map((error) => error.detail)
 						}) );
 				});
        	 
         	})
		}

	};


	var widget = _.extend({}, widgetRoot, extended);

	// register presence with screen manager
	Dashboard.addWidget(widget);
};
