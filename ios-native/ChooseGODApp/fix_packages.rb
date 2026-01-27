require 'xcodeproj'

project_path = 'ChooseGOD.xcodeproj'
project = Xcodeproj::Project.open(project_path)

target = project.targets.first

# Find the packages
supabase_pkg = project.root_object.package_references.find { |p| p.repositoryURL.include?('supabase') }
revenuecat_pkg = project.root_object.package_references.find { |p| p.repositoryURL.include?('revenuecat') || p.repositoryURL.include?('purchases') }

if supabase_pkg.nil? || revenuecat_pkg.nil?
  puts "❌ Packages not found in project!"
  exit 1
end

# Get or create frameworks build phase
frameworks_phase = target.frameworks_build_phase

# Add Supabase product to target
supabase_dep = target.package_product_dependencies.find { |d| d.product_name == 'Supabase' }
if supabase_dep.nil?
  supabase_dep = project.new(Xcodeproj::Project::Object::XCSwiftPackageProductDependency)
  supabase_dep.product_name = 'Supabase'
  supabase_dep.package = supabase_pkg
  target.package_product_dependencies << supabase_dep
end

# Add RevenueCat product to target  
rc_dep = target.package_product_dependencies.find { |d| d.product_name == 'RevenueCat' }
if rc_dep.nil?
  rc_dep = project.new(Xcodeproj::Project::Object::XCSwiftPackageProductDependency)
  rc_dep.product_name = 'RevenueCat'
  rc_dep.package = revenuecat_pkg
  target.package_product_dependencies << rc_dep
end

# Create build file references for the frameworks phase
# Supabase
supabase_ref = project.new(Xcodeproj::Project::Object::PBXBuildFile)
supabase_ref.product_ref = supabase_dep
frameworks_phase.files << supabase_ref unless frameworks_phase.files.any? { |f| f.product_ref&.product_name == 'Supabase' }

# RevenueCat
rc_ref = project.new(Xcodeproj::Project::Object::PBXBuildFile)
rc_ref.product_ref = rc_dep
frameworks_phase.files << rc_ref unless frameworks_phase.files.any? { |f| f.product_ref&.product_name == 'RevenueCat' }

project.save

puts "✅ Fixed package linkage"
puts "   - Supabase: #{supabase_dep.product_name}"
puts "   - RevenueCat: #{rc_dep.product_name}"
