require 'xcodeproj'

project_path = 'ChooseGOD.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# Add Supabase package
supabase_ref = project.new(Xcodeproj::Project::Object::XCRemoteSwiftPackageReference)
supabase_ref.repositoryURL = 'https://github.com/supabase-community/supabase-swift'
supabase_ref.requirement = { 'kind' => 'upToNextMajorVersion', 'minimumVersion' => '2.0.0' }
project.root_object.package_references << supabase_ref

# Add RevenueCat package  
revenuecat_ref = project.new(Xcodeproj::Project::Object::XCRemoteSwiftPackageReference)
revenuecat_ref.repositoryURL = 'https://github.com/RevenueCat/purchases-ios'
revenuecat_ref.requirement = { 'kind' => 'upToNextMajorVersion', 'minimumVersion' => '4.43.0' }
project.root_object.package_references << revenuecat_ref

# Get main target
target = project.targets.first

# Add Supabase product dependency
supabase_dep = project.new(Xcodeproj::Project::Object::XCSwiftPackageProductDependency)
supabase_dep.product_name = 'Supabase'
supabase_dep.package = supabase_ref
target.package_product_dependencies << supabase_dep

# Add RevenueCat product dependency
rc_dep = project.new(Xcodeproj::Project::Object::XCSwiftPackageProductDependency)
rc_dep.product_name = 'RevenueCat'
rc_dep.package = revenuecat_ref
target.package_product_dependencies << rc_dep

project.save

puts "✅ Added Supabase and RevenueCat packages to project"
