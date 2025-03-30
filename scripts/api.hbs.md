# API

<div class="api-index">

{{#jsdocData}}

<div class="class">

## [**{{name}}**](#{{{name}}})
### Methods
{{#methods}}
  - [{{indexname}}](#{{{longname}}})
{{/methods}}
### Properties
{{#properties}}
  - [{{indexname}}](#{{{longname}}})
{{/properties}}

</div>

{{/jsdocData}}

</div>

<!--endtoc-->

{{#jsdocData}}

# <a name="{{{name}}}"></a> {{name}} (Class)

{{#children}}

## <a name="{{{longname}}}"></a> {{{signature}}}{{{parens}}}

{{{description}}}

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
