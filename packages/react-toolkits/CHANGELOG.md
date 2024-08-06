# react-toolkits

## 0.12.0

### Minor Changes

- ea9eec6: feat: add App-id header in QueryList

## 0.11.2

### Patch Changes

- 45dfc1e: fix: swr http request should be triggered after game changed

## 0.11.1

### Patch Changes

- 5abae83: feat: change layout animation duration

## 0.11.0

### Minor Changes

- 6edd036: feat: store layout collapse state

## 0.10.3

### Patch Changes

- a95dc46: feat: asider collapsible

## 0.10.2

### Patch Changes

- c2cd888: feat: parse query string in standard url when using has mode router

## 0.10.1

### Patch Changes

- a3cb8c4: chore: change repo path

## 0.10.0

### Minor Changes

- c3216f4: feat: set the default type of a generic of QueryList

## 0.9.7

### Patch Changes

- c22fc12: fix: avoid duplicate fetching games

## 0.9.6

### Patch Changes

- 3358001: chore: some changes

## 0.9.5

### Patch Changes

- 9b8a9f5: fix: QueryListAction should be exported as const not a type

## 0.9.4

### Patch Changes

- ecfff90: fix: path is not right

## 0.9.3

### Patch Changes

- 87a9516: feat: add 'buttonsAlign' prop for FilterFormWrapper component"

## 0.9.2

### Patch Changes

- fdb77cc: feat: involke refetchGames when setting game

## 0.9.1

### Patch Changes

- 8b2935f: feat: transfer game id type

## 0.9.0

### Minor Changes

- 6266866: refactor: extract redirect to sign in page logic to react-toolkits

### Patch Changes

- 6266866: feat: add ExpandableParagraph component

## 0.8.94

### Patch Changes

- c53b404: feat: add ExpandableParagraph component

## 0.8.93

### Patch Changes

- 89c082c: fix: impor permission pages failed

## 0.8.92

### Patch Changes

- c8ccee9: Rollback eslint version

## 0.8.91

### Patch Changes

- d5f13a6: fix: missing declaration files

## 0.8.90

### Patch Changes

- bee0d60: Upgrade all depnedencies

## 0.8.89

### Patch Changes

- e5352c9: feat: access FormInstance throught QueryList getDataSource callback

## 0.8.88

### Patch Changes

- d3b3d59: fix: shoulde call setGame before involking mutate

## 0.8.87

### Patch Changes

- 806d2ad: fix: useRequest return a closure that caused state not updated

## 0.8.86

### Patch Changes

- 2faca9f: fix: should not call mutate in removeFromStore function

## 0.8.85

### Patch Changes

- 2489789: fix: cache of swr not cleared in QueryList

## 0.8.84

### Patch Changes

- 928c7ba: fix: missing disabled prop

## 0.8.83

### Patch Changes

- be36a71: feat: add 'disabled' prop for PermissionButton

## 0.8.82

### Patch Changes

- 974cb1d: fix: not mutate QueryList swr cache when it been unmounted

## 0.8.81

### Patch Changes

- e6fb9c9: fix: build failed
- eee6e98: fix: cache of QueryList been removed failed
- d3c47f1: ci: trigger building
- e35c158: fix: eslint error

## 0.8.80

### Patch Changes

- e6660fd: fix: swr cache be cleared failed

## 0.8.79

### Patch Changes

- c482eca: feat: mutate swr data in QueryList when it been unmounted

## 0.8.78

### Patch Changes

- cc4c1c4: feat: refresh default page insteading of 1

## 0.8.77

### Patch Changes

- c8473f1: feat: access data in extra render function

## 0.8.76

### Patch Changes

- c7c1667: fix: ignore game request when 'usePermissionApiV2' is true

## 0.8.75

### Patch Changes

- 2f4cb66: chore: revert

## 0.8.74

### Patch Changes

- ea82f79: fix: setGame should been involked before clearCache

## 0.8.73

### Patch Changes

- 60786c8: feat: trigger data update in QueryList when props change

## 0.8.72

### Patch Changes

- 5d18b9a: feat: access formInstance from outside of QueryList

## 0.8.71

### Patch Changes

- 5ee13f4: fix: request responseType option been overrided

## 0.8.70

### Patch Changes

- bc8f109: feat: rename typescript defination files from .d.mts to .d.ts

## 0.8.69

### Patch Changes

- 19d5297: build: replace vite with tsup

## 0.8.68

### Patch Changes

- 724e129: refactor: subscribe useTokenStore change

## 0.8.67

### Patch Changes

- a664b5d: fix: typescript types declaration issue

## 0.8.66

### Patch Changes

- ececcbc: feat: render extras of InfiniteList

## 0.8.65

### Patch Changes

- cb8fd98: feat: add Authorization header

## 0.8.64

### Patch Changes

- 17999b6: fix: originalData not updated when refetching in QueryList

## 0.8.63

### Patch Changes

- 9812dba: Refactor useGameStore hook

## 0.8.62

### Patch Changes

- b49f737: fix: http request not be triggered sometimes

## 0.8.61

### Patch Changes

- a2c318a: chore: remove onRehydrateStorage

## 0.8.60

### Patch Changes

- 2060653: fix: data does not updated while game has changed
- 2060653: refactor: add useRequest hook

## 0.8.59

### Patch Changes

- ef70ecd: chore: refacotr

## 0.8.58

### Patch Changes

- 6683157: fix: swr should revalidate when Querylist mount

## 0.8.57

### Patch Changes

- 26d7905: fix: clear swr cache when key is null in QueryList

## 0.8.56

### Patch Changes

- 225ac9c: fix: swr data not updated when game change in QueryList

## 0.8.55

### Patch Changes

- d871c0a: chore: debug

## 0.8.54

### Patch Changes

- 6436653: feat: remove swr cache before QueryList be destroyed

## 0.8.53

### Patch Changes

- f9bad37: fix: swr cache does not been cleared

## 0.8.52

### Patch Changes

- 96062ca: Revert "refactor: change mutate params in useQueryListStore hook"

## 0.8.51

### Patch Changes

- 07facd6: refactor: change mutate params in useQueryListStore hook

## 0.8.50

### Patch Changes

- 5d662f0: fix: ts types error

## 0.8.49

### Patch Changes

- b942a8d: feat: add originalData attribute in QueryList ref

## 0.8.48

### Patch Changes

- f4e56f1: refactor: fix QueryList serialize bugs

## 0.8.47

### Patch Changes

- 90108b5: refactor: new QueryList serialize function

## 0.8.46

### Patch Changes

- 5064050: feat: add remove function

## 0.8.45

### Patch Changes

- c5d1b38: fix: missing formValues in body

## 0.8.44

### Patch Changes

- e6e7956: refactor: custom swr key serialize and deserialize

## 0.8.43

### Patch Changes

- 0a7f5cf: feat: add opts parameter in reponseInterceptor

## 0.8.42

### Patch Changes

- 61daed3: feat: add responseInterceptor

## 0.8.41

### Patch Changes

- 1b9e1b2: feat: add 'components' prop

## 0.8.40

### Patch Changes

- c7c3fd6: feat: export RequestResponse type

## 0.8.39

### Patch Changes

- b44ef9c: feat: add some dependencies of useEffect hook

## 0.8.38

### Patch Changes

- 907934b: Trigger ci

## 0.8.37

### Patch Changes

- 4b6de2e: feat: add isGlobal context
- 4b6de2e: fix: isGlobal missing default value

## 0.8.36

### Patch Changes

- 5b45609: feat: export operation to content render function

## 0.8.35

### Patch Changes

- 29ee84e: feat: add hideAll function

## 0.8.34

### Patch Changes

- ff6e149: feat: cache modal uuid

## 0.8.33

### Patch Changes

- 8f4a65f: feat: export modal store

## 0.8.32

### Patch Changes

- eb89ae6: fix: type error

## 0.8.31

### Patch Changes

- 491415d: fix: type declaration error

## 0.8.30

### Patch Changes

- 9dd0737: feat: access extraValues in content render

## 0.8.29

### Patch Changes

- 9a94283: feat: allow pass formInstance from outside of useFormModal hook

## 0.8.28

### Patch Changes

- 6512e7b: fix: missing default page and size in QueryList

## 0.8.27

### Patch Changes

- a0b1ead: feat: add layoutHeaderExtras prop

## 0.8.26

### Patch Changes

- 7046d58: fix: missing isGlobal config in useTokenValidation hook

## 0.8.25

### Patch Changes

- 4699f38: chore: update Highlight styles

## 0.8.24

### Patch Changes

- 2095f42: refactor: update modal hooks props
- 87c2d79: feat: add loading for modal

## 0.8.23

### Patch Changes

- 4e3c9a2: feat: add useModal hook

## 0.8.22

### Patch Changes

- 9cffb64: refactor: store modal state in zustand

## 0.8.21

### Patch Changes

- 5fd2486: feat: add refreshGames function

## 0.8.20

### Patch Changes

- 36ba90c: chore: print log for debug

## 0.8.19

### Patch Changes

- 02639fc: fix: set isLoading failed

## 0.8.18

### Patch Changes

- 1e8f78c: refactor: move games initilization logic to onRehydrateStorage hook

## 0.8.17

### Patch Changes

- 06745a0: refactor: change useGameStore api

## 0.8.16

### Patch Changes

- 71192c8: feat: custom routes

## 0.8.15

### Patch Changes

- 12f2666: feat: export pages

## 0.8.14

### Patch Changes

- 532a4da: feat: add 'signInSuccessRedirect' prop

## 0.8.13

### Patch Changes

- f849f09: feat: force update when swr key not changed in QueryList

## 0.8.12

### Patch Changes

- f6472cf: feat: add signInPageTitle prop

## 0.8.11

### Patch Changes

- 935c265: feat: change the type of Provider appTitle prop

## 0.8.10

### Patch Changes

- 7180387: chore: change Layout title styles

## 0.8.9

### Patch Changes

- 3f3face: fix: type error

## 0.8.8

### Patch Changes

- 535e2db: fix: type error

## 0.8.7

### Patch Changes

- edf9c98: fix: change PermissionButton every to some

## 0.8.6

### Patch Changes

- 0888097: feat: PermissionButton code prop support array

## 0.8.5

### Patch Changes

- 31541d6: fix: change every to some

## 0.8.4

### Patch Changes

- f20dadd: fix: mutate QueryList store failed

## 0.8.3

### Patch Changes

- 901d84b: feat: hide parent when all children has no permission

## 0.8.2

### Patch Changes

- 443676b: refactor: remove skip aurgument for useTokenValidation hook

## 0.8.1

### Patch Changes

- 73c9ecf: chore: split handsontable component to individual package

## 0.8.0

### Minor Changes

- 9593459: feat: add DiffTable

## 0.7.4

### Patch Changes

- 88cfd8d: feat: include code in RequestError

## 0.7.3

### Patch Changes

- abd52b3: feat: set revalidateOnFocus to false

## 0.7.2

### Patch Changes

- 7d91a12: fix: useValidateToken hook excution twice not allowed

## 0.7.1

### Patch Changes

- 0053d0e: fix: QueryList data not initialized sometimes

## 0.7.0

### Minor Changes

- b30e737: refactor: change QueryList api

## 0.6.5

### Patch Changes

- 6b8bb8b: refactor: add arg prop in useQueryListStore payload

## 0.6.4

### Patch Changes

- d14f602: Revert "chore: set revalidateOnFocus to false in usePermissions hook"
- d14f602: feat: set revalidateOnFocus to false of usePermissions hook

## 0.6.3

### Patch Changes

- 139646e: chore: set revalidateOnFocus to false

## 0.6.2

### Patch Changes

- b15ba30: feat: add 'onTableChange' prop

## 0.6.1

### Patch Changes

- 3fa4f14: fix: hide Alert in sign in page

## 0.6.0

### Minor Changes

- ecf620a: refactor: new sign in page design

## 0.5.0

### Minor Changes

- dc3a327: build: replace tsup with vite

## 0.4.5

### Patch Changes

- 9e342fd: feat: override default styles

## 0.4.4

### Patch Changes

- 4bc6083: fix: openKeys and selectedKeys is wrong while react-router redirect

## 0.4.3

### Patch Changes

- b9f9fac: fix: missing props in withBaseRoutes
- 6085010: chore: update demo
- bae44cb: fix: directory name capitalization error
- 5132166: fix: missing export member
- 9d25a6b: fix: delay effect

## 0.4.2

### Patch Changes

- 46ca83c: fix: missing app-id while isGlobal is true

## 0.4.1

### Patch Changes

- ec72527: feat: ignore app-id header while game select is hidden

## 0.4.0

### Minor Changes

- 6f0f3ea: 1. refacotr: optimize the rendering of NavMenu
  2: feat: add cypress test cases 2. chore: update react-web demo

## 0.3.50

### Patch Changes

- 1a017ac: chore: upgrade dependencies

## 0.3.49

### Patch Changes

- bd7138b: fix: select dropdown menu was overrided by Modal

## 0.3.48

### Patch Changes

- 1928769: feat: wrap page component with Layout

## 0.3.47

### Patch Changes

- eadcc84: feat: add log routes

## 0.3.46

### Patch Changes

- 794d9dd: feat: change locale scope

## 0.3.45

### Patch Changes

- e197d78: feat: add 'Content-Type' header in request function

## 0.3.44

### Patch Changes

- c734ab9: feat: add extra prop

## 0.3.43

### Patch Changes

- 060f3ae: feat: add form field in QueryList ref

## 0.3.42

### Patch Changes

- 4cadbbc: feat: change ref of QueryList

## 0.3.41

### Patch Changes

- 8035fcf: feat: ref of QueryList

## 0.3.40

### Patch Changes

- 0a3655e: fix: not initialized sometimes

## 0.3.39

### Patch Changes

- 5018e65: fix: dataSource been cleared while the pagiantion data changed

## 0.3.38

### Patch Changes

- a8e08cf: fix: encountered two children with the same key 'modal-holder'

## 0.3.37

### Patch Changes

- eb59f47: feat: add noPagination prop in QueryList component

## 0.3.36

### Patch Changes

- d478a6d: refactor: useFormModal hook

## 0.3.35

### Patch Changes

- 450ac93: feat: clear swr cache

## 0.3.34

### Patch Changes

- d40c98d: feat: access form instance in onConfirm callback

## 0.3.33

### Patch Changes

- 0370608: refactor: access form instance from outside of useFormModal hook
- 0bf188e: refactor: access form instance from outside of QueryList

## 0.3.32

### Patch Changes

- cf5b4d8: refactor: store pagination data in map

## 0.3.31

### Patch Changes

- 2851b4b: fix: typo

## 0.3.30

### Patch Changes

- b818404: feat: add "refreshInterval" prop for QueryList component

## 0.3.29

### Patch Changes

- a297f95: feat: rerender children in Layout component while game changed

## 0.3.28

### Patch Changes

- 5616b2e: fix: operator priority error

## 0.3.27

### Patch Changes

- 3b0180e: feat: replace isValidating with isLoading

## 0.3.26

### Patch Changes

- fe3888f: fix: pagination number may be NaN

## 0.3.25

### Patch Changes

- c078f70: fix: maximum update depth exceeded

## 0.3.24

### Patch Changes

- 34b3bd1: fix: game should not to be null
- 55755e5: refactor: remove useQueryListMutate hook

## 0.3.23

### Patch Changes

- a0fa291: feat: set game to null while current game is not exsiting in options

## 0.3.22

### Patch Changes

- cf4e541: feat: preseve data when mutating

## 0.3.21

### Patch Changes

- 6d92622: refactor: rename ContextProvider api
- 639b0db: refactor: use new swr key in QueryList component
- c3d640b: feat: merge queries in url and params
- 639b0db: refactor: new QueryList swr key
- d26afc9: refactor: change game change callback

## 0.3.20

### Patch Changes

- a90e311: refactor: change RequireGame display

## 0.3.19

### Patch Changes

- c67ef05: fix: RequireGame copywrite is wrong
- 63a76e3: feat: change request options

## 0.3.18

### Patch Changes

- 4751aa7: refactor: use query-string lib process query params

## 0.3.17

### Patch Changes

- 2e4a969: chore: rollback

## 0.3.16

### Patch Changes

- 1b77aa0: chore: rollback

## 0.3.15

### Patch Changes

- 217fae8: refactor: react-toolkits QueryList

## 0.3.14

### Patch Changes

- 7f1c9b7: feat: set timer to 0 ms

## 0.3.13

### Patch Changes

- a2d2e19: feat: export enum QueryListAction

## 0.3.12

### Patch Changes

- ec2fb3c: feat: set isGlobal to true

## 0.3.11

### Patch Changes

- b9b1ce0: feat: remove isGlobal prop

## 0.3.10

### Patch Changes

- 4d657eb: feat: clear cache

## 0.3.9

### Patch Changes

- 5432d5b: feat(alpha): reload page after switching game

## 0.3.8

### Patch Changes

- a320abc: fix: app-id header not right in request function

## 0.3.7

### Patch Changes

- 9712dc2: fix: useValidateToken hook 404

## 0.3.6

### Patch Changes

- 36adce8: feat: pass formInstance to child

## 0.3.5

### Patch Changes

- a745421: feat: clear swr cache when switching game

## 0.3.4

### Patch Changes

- 3982f5e: feat: add localeDropdownMenu option

## 0.3.3

### Patch Changes

- ce87e84: feat: add translations

## 0.3.2

### Patch Changes

- 860eeec: feat: support i18n
- 3dbfca6: refactor: combine useQueryListJump and useQueryListMutate into useQueryListMutate

## 0.3.1

### Patch Changes

- 6ff6463: feat: add extras for FilterFormWrapper

## 0.3.0

### Minor Changes

- fbd5680: feat: return some original data in reponse of request function

## 0.2.29

### Patch Changes

- 4040d6a: feat: add 'responseType' in request function

## 0.2.28

### Patch Changes

- 2e04198: fix: dead loop for token validation

## 0.2.27

### Patch Changes

- 9df4527: feat: remove suspense in usePermissions hook

## 0.2.26

### Patch Changes

- 38077e9: feat: delay token validation request

## 0.2.25

### Patch Changes

- 3f68ddd: feat: check if token is valid

## 0.2.24

### Patch Changes

- 32cbf9d: fix: toolkitContextStore is not synchronized

## 0.2.23

### Patch Changes

- c6825d1: fix: ContextProvider title value issue
- 99bd364: feat: cache ToolkitsContext config

## 0.2.22

### Patch Changes

- a9d0a28: feat: set default values for ContextProvider

## 0.2.21

### Patch Changes

- c6c3627: feat: add 'params' property for request function

## 0.2.20

### Patch Changes

- fceb92e: fix: missing isGlobal prop in ContextProvider

## 0.2.19

### Patch Changes

- db1c013: feat: hide FilterFormWrapper when renderForm is undefined

## 0.2.18

### Patch Changes

- cd0dea1: fix: missing form prop

## 0.2.17

### Patch Changes

- e49fc1c: some features of react-toolkits

## 0.2.16

### Patch Changes

- 6d43fa6: feat: change parameters type of useQueryListMutate

## 0.2.15

### Patch Changes

- 46d3223: fix: typo

## 0.2.14

### Patch Changes

- 5addd49: feat: delay QueryList init function call

## 0.2.13

### Patch Changes

- d7349bc: fix type issues

## 0.2.12

### Patch Changes

- e7ef5ff: refactor: replace useSWRMutation with useSWR in QueryList component

## 0.2.11

### Patch Changes

- 450de65: fix: perform request while form is invalid

## 0.2.10

### Patch Changes

- c449bda: refactor: new form instance

## 0.2.9

### Patch Changes

- 99c0392: feat: cache form instance

## 0.2.8

### Patch Changes

- 3aa9d03: refactor: change permision type

## 0.2.7

### Patch Changes

- 49cf639: feat: export form from useFormModal hook

## 0.2.6

### Patch Changes

- a1daf00: feat: pass formInstance from outside

## 0.2.5

### Patch Changes

- a434999: fix: export QueryListAction wrong

## 0.2.4

### Patch Changes

- 82dc6ab: feat: export QueryListAction type

## 0.2.3

### Patch Changes

- ac6526f: feat: add afterQuerySuccess hook

## 0.2.2

### Patch Changes

- 850d6ae: release react-toolkits

## 0.2.1

### Patch Changes

- ea24738: change output

## 0.2.0

### Minor Changes

- 5178751: fix: json type response wrong

## 0.1.4

### Patch Changes

- 0c9c659: return not json response

## 0.1.3

### Patch Changes

- 9323922: change QueryList types

## 0.1.2

### Patch Changes

- 771e848: set Layout content overflow to 'overlay'

## 0.1.1

### Patch Changes

- 164900b: redraw Layout children when game change

## 0.1.0

### Minor Changes

- 6ea70f7: permission module support api v2

## 0.0.8

### Patch Changes

- 955ef06: typo

## 0.0.7

### Patch Changes

- e23ffd1: rewrite perPage to size
- c782902: upgrade prettier version

## 0.0.6

### Patch Changes

- 90f2dd0: release react-toolkits

## 0.0.5

### Patch Changes

- 3c0ff88: release react-toolkits

## 0.0.4

### Patch Changes

- a32af27: fix useFormModal hook can not set initialValues

## 0.0.3

### Patch Changes

- 1d40a67: filter nav items by permission

## 0.0.2

### Patch Changes

- 732b9bd: use org flow97

## 0.0.1

### Patch Changes

- e7f10f0: release
- afa5306: release

  Please enter a summary for your changes.
