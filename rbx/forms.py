from django import forms
from django.template.defaultfilters import slugify
from django.utils.safestring import mark_safe
from django.utils.translation import ugettext as _
from django.core.urlresolvers import reverse
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Field, Submit, Div

from rbx.models import UserProfile, Project


class HomeSignupForm(forms.Form):
    name = forms.CharField(max_length=100, label='',
        widget=forms.TextInput(attrs={'placeholder': _('Pick a username')}))
    email = forms.EmailField(label='',
        widget=forms.TextInput(attrs={'placeholder': _('Your email address')}))
    password = forms.CharField(label='', widget=forms.PasswordInput(attrs={
        'placeholder': _('Create a password')}))


class NewProjectForm(forms.Form):
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user')
        super(NewProjectForm, self).__init__(*args, **kwargs)
        self.fields = {
            'name': forms.CharField(),
            'owner': forms.ModelChoiceField(
                        # TODO: Add user's teams
                        UserProfile.objects.filter(pk=user.pk),
                        empty_label=None),
            'visibility': forms.ChoiceField(choices=(
                    ('public', mark_safe(
                        '<i class="icon-unlock icon-large"></i> Anyone can \
                        see the project. You can choose who can modify it.')),
                    ('private', mark_safe(
                        '<i class="icon-lock icon-large"></i> You can \
                        choose who can see and modify the project.')),
                ),
                widget=forms.RadioSelect,
                initial='public',
            ),
        }

        self.helper = FormHelper()
        self.helper.form_class = 'form-horizontal'
        self.helper.form_action = reverse('new_project')
        self.helper.html5_required = True
        self.helper.layout = Layout(
            Field('name', css_class='input-xlarge'),
            'owner',
            'visibility',
            Div(
                Div(
                    Submit('create_project', 'Create project',
                            css_class="btn-primary"),
                    css_class='controls',
                ),
                css_class='controls-group',
            ),
        )

    def clean_name(self):
        slug = slugify(self.cleaned_data['name'])
        user = self.cleaned_data['owner']
        if len(Project.objects.filter(slug=slug, owner=user)):
            raise forms.ValidationError(
                'Similar name already exists on this account')
        return self.cleaned_data['name']
