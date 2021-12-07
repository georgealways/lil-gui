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

{{{description}}}

{{#examples}}
```js
{{{.}}}
```
{{/examples}}

{{#with params}}
**Parameters**

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

<small><a href="{{{viewsource}}}">{{definedat}}</a></small>

{{/children}}

{{/jsdocData}}