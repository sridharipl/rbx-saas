var RBX = (function () {

    var _init = function () {
        _tooltips()
        _dissmissSiteAlert()
        _reloadPage()

        _modalFragment()
        _submitModalChanges()

        _selectToDropdown()
        _newBoxForm()

        _navTabs()
        _activateTabFromHash()

        _addParamChoices()
        _loadParamEdit()
        _submitParamEdit()
        _confirmAction()
    }

    var _tooltips = function () {
        $(window).on('resize', function () {
            if (!window.matchMedia || (window.matchMedia('(min-width: 979px)').matches))
                $('a[rel="tooltip"]').tooltip({placement: 'bottom'})
            else
                $('a[rel="tooltip"]').tooltip('destroy')
        }).trigger('resize')
        $('form i').tooltip()
    }

    var _dissmissSiteAlert = function () {
        $('.site-alert button.close').on('click', function () {
            $(this).parent().parent().remove()
        })
    }

    var _modalFragment = function () {
        $('.modal-fragment').on('click', function() {
            var target = $(this).attr('data-target')
            $(target).modal({keyboard: false})
            $(target + ' .modal-body').load($(this).attr('href') + ' #fragment')
            setTimeout(_populateReloadLocation, 600)
            return false;
        })
    }

    var _submitModalChanges = function () {
        var action = function () {
            var modal = $(this).parent().parent(),
                form = modal.find('form')
            modal.find('.modal-body').load(form.attr('action') + ' #fragment',
                form.serializeArray(), function () {
                modal.find('button.btn[data-dismiss="modal"]').text('Close')
                modal.on('hidden', function () {
                    modal.off('hidden')
                    if (modal.find('input[name=reload-location]').val()) {
                        location.href = modal.find('input[name=reload-location]').val()
                    } else {
                        location.reload()
                    }
                })
            })
            return false;
        }
        $('.submit-change').on('submit', action).on('click', action)
    }

    var _selectToDropdown = function () {
        $('select').each(function(i, e){
            if (!($(e).data('convert') == 'no')) {
                $(e).hide().wrap('<div class="btn-group" id="select-group-' + i + '" />')

                var select = $('#select-group-' + i),
                    current = ($(e).val()) ? $(e).find(':selected').text() : '&nbsp;'

                select.html('<input type="hidden" value="' + $(e).val() +
                                '" name="' + $(e).attr('name') + '" id="' + $(e).attr('id') +
                                '" class="' + $(e).attr('class') + '" />' +
                            '<a class="btn dropdown-toggle" data-toggle="dropdown" href="#""><span>' +
                              current +'</span> <span class="caret"></span></a>' +
                            '<ul class="dropdown-menu"></ul>')

                $(e).find('option').each(function(o,q) {
                    select.find('.dropdown-menu').append('<li><a href="#" data-value="' + $(q).attr('value') + '">' + $(q).text() + '</a></li>')
                    if ($(q).attr('selected'))
                        select.find('.dropdown-menu li:eq(' + o + ')').click();
                });

                select.find('.dropdown-menu a').click(function() {
                    select.find('input[type=hidden]').val($(this).data('value')).change()
                    select.find('.btn:eq(0) span:eq(0)').text($(this).text())
                    $(this).parent().parent().parent().removeClass('open')
                    return false
                });
            }
        });
    }

    var _navTabs = function () {
        $('a').on('click', function () {
            var href = $(this).attr('href')
            if (href.substr(0, 1) === '#' && $(href).hasClass('tab-pane')) {
                $('[href='+href+']').tab('show')
                location.hash = '/' + href.substr(1)
                return false
            }
        })
    }

    var _activateTabFromHash = function () {
        var hash = location.hash.substr(2),
            hashPieces = hash.split('?'),
            activeTab = $('[href=#' + hashPieces[0] + ']')
        activeTab && activeTab.tab('show')
    }

    var _newBoxForm = function () {
        $('.new_box').on('click', function () {
            $(this).parent().find('.box-list').append($('#tpl_box_form').html())
            $(this).remove()
            $('#id_source_repository').parent().append($('#id_repository_type').clone())
            $('#div_id_repository_type').remove()
            _selectToDropdown()
        })
    }

    var _populateReloadLocation = function () {
        var attrName = 'data-reload-populate'
        var reloadField = $('input['+attrName+']')
        if (reloadField.length) {
            var fieldName = reloadField.attr(attrName)
            var watchedField = reloadField.parent().find('[name='+fieldName+']')
            var initialValue = watchedField.val()
            watchedField.on('change', function () {
                var value = location.href.replace(initialValue, $(this).val())
                reloadField.attr('value', value)
            })
        }
    }

    var _addParamChoices = function () {
        var add_button = $('#add_param')
        add_button.on('click', function() {
            return false
        })
        add_button.popover({placement: 'top',
                            html: true,
                            content: $('#tpl_add_param_choice').html()})

        $(document).on('click', '#param_type a', function () {
            $('#new_param').load(location.pathname + '/param/'
                                 + $(this).attr('data-type') + ' #fragment', function() {
                _selectToDropdown()
            })
            add_button.popover('hide')
            add_button.parent().hide()
            return false
        })
    }

    var _submitParamEdit = function () {
        $(document).on('click', '#configure .save_param', function () {
            var form = $(this).parent().parent().parent()
            form.parent().load(form.attr('action') + ' #fragment', form.serializeArray(), _selectToDropdown)
            return false
        })
    }

    var _loadParamEdit = function () {
        $('.edit-param').on('click', function () {
            $(this).closest('.parameter').load(location.pathname + '/param/'
                                               + $(this).closest('.parameter').attr('data-param')
                                               + ' #fragment', function() {
                _selectToDropdown()
            })
        })
    }

    var _reloadPage = function () {
        $(document).on('click', '.reload', function () {
            location.reload()
            return false
        })
    }

    var _confirmAction = function () {
        $(document).on('click', '.confirm-action', function () {
            if (!$(this).hasClass('warmed')) {
                $(this).addClass('btn-danger').addClass('warmed').val($(this).attr('data-confirm'))
                return false
            }

            var id = $(this).closest('.parameter').attr('data-param')
            console.log(id)
            if (id !== undefined)
                $.get(location.pathname + '/param/delete/' + id, function () {
                    location.reload()
                })
            return false
        })
    }

    return {
        init: _init,
    }

})()

$(document).ready(RBX.init())
