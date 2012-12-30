from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.utils.translation import ugettext as _
from actstream import action
from rbx.models import UserProfile, Project


def on_user_profile_created(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

post_save.connect(on_user_profile_created, sender=User)


def on_project_saved(sender, instance, created, **kwargs):
    if created:
        action.send(instance.owner, verb=_('created'), target=instance)
    action.send(instance.owner, verb=_('updated'), target=instance)

post_save.connect(on_project_saved, sender=Project)
