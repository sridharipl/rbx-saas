import os
from mimetypes import guess_type
from json import loads
from django import template
from django.core.urlresolvers import reverse
from django.utils.safestring import mark_safe

from settings import EDIT_RIGHT, ADMIN_RIGHT

register = template.Library()


@register.simple_tag
def title(value):
    return '%s &mdash; Run in the Box' % value


@register.filter
def is_visible(project, user):
    return project.is_allowed(user)


@register.filter
def is_editable(project, user):
    return project.is_allowed(user, EDIT_RIGHT)


@register.filter
def can_admin(project, user):
    return project.is_allowed(user, ADMIN_RIGHT)


@register.filter
def profile_url(user, username):
    return mark_safe('<a href="%s">%s</a>' %
                     (reverse('profile', args=[username]), user))


@register.filter
def error_block(msg):
    return mark_safe('<span class="help-block">%s</span>' % msg)


@register.filter
def elapsed(seconds):
    suffixes = ['y', 'w', 'd', 'h', 'm', 's']
    add_s = False
    separator = ' '
    time = []
    parts = [(suffixes[0], 60 * 60 * 24 * 7 * 52),
             (suffixes[1], 60 * 60 * 24 * 7),
             (suffixes[2], 60 * 60 * 24),
             (suffixes[3], 60 * 60),
             (suffixes[4], 60),
             (suffixes[5], 1)]
    if seconds == 0:
        return str(seconds) + suffixes[-1]
    for suffix, length in parts:
        value = int(seconds / length)
        if value > 0:
            seconds = seconds % length
            time.append('%s%s' % (str(value),
                                  (suffix, (suffix, suffix + 's')[value > 1])[add_s]))
            if seconds < 1:
                break
    return separator.join(time)


@register.filter
def own_run(runs, user):
    if not user.is_authenticated():
        return []
    return [r for r in runs if r.user == user.get_profile()]


@register.filter
def restrict(projects, user):
    if not user.is_authenticated():
        return [p for p in projects if p.public]
    return [p for p in projects if p.public or p.is_allowed(user)]


@register.filter
def hide(obj, user):
    return [o for o in obj if not hasattr(o.object, 'is_allowed') or o.object.is_allowed(user)]


@register.filter
def from_json(struct, field):
    json = loads(struct)
    return json.get(field, '')


@register.filter
def basename(filename):
    return os.path.basename(filename)


@register.filter
def insert(filepath):
    mimetypes, _ = guess_type(filepath)
    if not mimetypes:
        return "<p>Can't display file. See raw content</p>"
    elif mimetypes == 'application/pdf':
        return """
<object type="application/pdf" data="%s">
    <p>Oops, your browser can't display this PDF file</p>
</object>
""" % filepath
    elif mimetypes.startswith('image'):
        return '<img src="%s" alt="%s" />' % (filepath, os.path.basename(filepath))
    elif mimetypes.find('plain') != -1 or mimetypes.find('xml') != -1 or mimetypes.find('text') != -1:
        with open(filepath) as fd:
            return "<pre>%s</pre>" % fd.read()

