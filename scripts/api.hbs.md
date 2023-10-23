# API

<div class="api-index">

{{#jsdocData}}

<div class="class">

## [**{{name}}** (Class)](#{{{name}}})
{{#children}}
  - [{{indexname}}](#{{{longname}}})
{{/children}}

</div>

{{/jsdocData}}

</div>

<!--endtoc-->

{{#jsdocData}}

# <a name="{{{name}}}"></a> {{name}} (Class)

{{#children}}

## <a name="{{{longname}}}"></a> {{{signature}}}{{{parens}}}

{{{description}}} <small>(<a href="{{{sourcelink}}}">{{sourcetext}}</a>)</small>

{{#examples}}
```js
{{{.}}}
```
{{/examples}}

{{#with params}}

{{#.}}
 - **{{name}}**{{#with description}} - {{{.}}}{{/with}}<br>
 <small>
{{#if defaultvalue}}Default: `{{{defaultvalue}}}`
{{else}}
{{#if optional}}Optional:
{{else}}Required: 
{{/if}}
{{#type.names}}`{{.}}`{{#unless @last}} or {{/unless}}{{/type.names}}
{{/if}}
</small>

{{/.}}
{{/with}}

{{#with returntype}}
**Returns**: `{{{.}}}`
{{/with}}


{{/children}}

{{/jsdocData}}
